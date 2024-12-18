import React, { useState } from 'react';
import { IoMdMicOff, IoMdMic } from "react-icons/io";
import { HiMiniSpeakerWave } from "react-icons/hi2";

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './index.css';

const ContactSupport = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [input, setInput] = useState("");
  const [showMicOn, setShowMicOn] = useState(true);

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  const readAloud = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleStartListening = () => {
    setShowMicOn(false);
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };

  const handleStopListening = () => {
    setShowMicOn(true);
    SpeechRecognition.stopListening();
    setInput(transcript);
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: transcript, sender: "user" },
    ]);
    resetTranscript();
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user" };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiResponse = {
          text: data.response,
          sender: "ai",
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      } else {
        const aiErrorResponse = {
          text: data.error || "Sorry, something went wrong. Please try again later.",
          sender: "ai",
        };
        setMessages((prevMessages) => [...prevMessages, aiErrorResponse]);
      }
    } catch (error) {
      console.error('Error:', error);
      const aiErrorResponse = {
        text: "Sorry, something went wrong. Please try again later.",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, aiErrorResponse]);
    }
  };

  return (
    <div className="main-1">
      <div className="contact-support-container">
        <h2>Contact Support AI</h2>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === "user" ? "user-message" : "ai-message"}`}
            >
              <p>{msg.text}</p>
              {msg.sender === "ai" && (
                <button onClick={() => readAloud(msg.text)} className="read-out-button">
                  <HiMiniSpeakerWave/>
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={showMicOn ? handleStartListening : handleStopListening}
            className="button-mic"
          >
            {showMicOn ? <IoMdMic /> : <IoMdMicOff />}
          </button>
          <button onClick={handleSendMessage} className="button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
