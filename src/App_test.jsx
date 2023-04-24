import { useState, useEffect } from 'react';
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function App() {
    const [qrCode, setQrCode] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const client = new Client();

        client.on('qr', (qr) => {
            qrcode.generate(qr, {small: true});
            setQrCode(qr);
        });

        client.on('ready', () => {
            console.log('Client is ready!');
            setIsReady(true);
        });

        client.on('message', async (message) => {
            console.log(message.body);

            if(message.body.startsWith("#")) {
                const result = await runCompletion(message.body.substring(1));
                client.sendMessage(message.from, result);
            }

            setMessages((prevMessages) => [...prevMessages, message]);
        });

        client.initialize();

        return () => {
            client.destroy();
        };
    }, []);

    async function runCompletion (message) {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: message,
            max_tokens: 200,
        });
        return completion.data.choices[0].text;
    }

    return (
        <div>
            {qrCode && <img src={`data:image/png;base64, ${qrCode}`} alt="QR code" />}
            {isReady && <p>Client is ready!</p>}
            <ul>
                {messages.map((message, index) => (
                    <li key={index}>{message.body}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;