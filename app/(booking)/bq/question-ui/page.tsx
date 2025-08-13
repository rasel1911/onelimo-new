
"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `You said: "${newMessage.text}"` },
      ]);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="w-full md:w-1/3 flex flex-col h-[80vh] bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-2xl shadow-md backdrop-blur-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none border border-indigo-500"
                    : "bg-gray-700 text-gray-100 rounded-bl-none border border-gray-600"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-4 bg-gray-900 border-t border-gray-700 shadow-lg">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-gray-800 text-gray-100 border border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition-colors duration-200 shadow-lg border border-indigo-500 hover:border-indigo-400"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
