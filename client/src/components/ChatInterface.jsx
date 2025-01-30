import React, { useState } from "react";
import axios from "axios";
import "./ChatInterface.scss";
import send from "../assets/send.png";

const ChatInterface = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { type: "system", message: "Welcome to the AI chat!" },
  ]);
  const [userMessage, setUserMessage] = useState("");

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSend = async () => {
    if (!userMessage.trim()) return;
  
    let tempMessage = userMessage
    setUserMessage("")
    // Add user's message to chat history
    setChatHistory((prev) => [...prev, { type: "user", message: tempMessage }]);
  
    try {
      // Send user's message to the API
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        message: tempMessage,
      });
  
      // Add system's response to chat history
      setChatHistory((prev) => [
        ...prev,
        { type: "system", message: response.data.reply },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "system",
          message: "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      // Clear the input field
      setUserMessage("");
    }
  };
  

  return (
    <div className="chat-container">
      {/* Chat Icon */}
      <div className="chat-icon" onClick={toggleChat}>
        💬 {/* Chat icon */}
      </div>

      {/* Chat Interface */}
      {isChatOpen && (
        <div className="chat-interface">
          <div className="aiAvatarChatInterface">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={
                  chat.type === "system"
                    ? "aiAvatarSystemChat"
                    : "aiAvatarUserChat"
                }
              >
                {chat.message}
              </div>
            ))}
          </div>
          <div className="chatInputContainer">
            <input
              type="text"
              className="chatInput"
              value={userMessage}
              placeholder="Type your message..."
              onChange={(e) => setUserMessage(e.target.value)} // Update state on input
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend(); // Send message on Enter key
              }}
            />
            <div className="sendButton" onClick={handleSend}>
              <img src={send} alt="Send" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
