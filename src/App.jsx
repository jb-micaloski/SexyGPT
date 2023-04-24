import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { Axios } from 'axios'

const API_KEY = "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";

// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = "Explain things like you're talking to a software professional with 5 years of experience, in pt-br";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Olá, eu sou André Diamand, idealizador da Metodologia Sexy Canvas! Em que posso ajudar?)",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];//// [(message1,message2,message3), newMessage]
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    //await processMessageToChatGPT(newMessages);
    await processMessageToBerri(newMessage, newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  async function processMessageToBerri(query, chatMessages) { // messages is an array of messages
    // Format messages for Berri API

    let apiMessages = chatMessages.map((messageObject) => {
      let content = messageObject.message;
      return { content }
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 

    const params = {
      "user_email" : "samueldamazio@hotmail.com",
      "instance_id" : "9094293b-2130-43ed-b1fc-37900755b8da",
      "query": query.message,
      "model": "gpt-4",
      "dynamic_prompt": systemMessage,
      "history": JSON.stringify([
        ...apiMessages // The messages from our chat with ChatGPT
      ])
    }

    const url = new URL("https://api.berri.ai/query");
    url.search = new URLSearchParams(params).toString();
    
    await fetch(url, 
    {
      method: "GET",
    }).then((response) => {
      return response.json();
    }).then((response) => {
      console.log(response);
      setMessages([...chatMessages, {
        message: response.response,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    }).catch((error) => {
      console.error(error);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ height: "100vh" , width: "100vh"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
