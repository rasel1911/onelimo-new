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
			setMessages((prev) => [...prev, { sender: "bot", text: `You said: "${newMessage.text}"` }]);
		}, 500);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") sendMessage();
	};

	return (
		<div className="flex min-h-screen items-start justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
			<div className="flex h-[80vh] w-full flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-2xl md:w-1/3">
				{/* Chat Messages */}
				<div className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 flex-1 space-y-4 overflow-y-auto p-4">
					{messages.map((msg, idx) => (
						<div
							key={idx}
							className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-xs rounded-2xl p-3 shadow-md backdrop-blur-sm ${
									msg.sender === "user"
										? "rounded-br-none border border-indigo-500 bg-indigo-600 text-white"
										: "rounded-bl-none border border-gray-600 bg-gray-700 text-gray-100"
								}`}
							>
								{msg.text}
							</div>
						</div>
					))}
					<div ref={chatEndRef} />
				</div>

				{/* Input Box */}
				<div className="border-t border-gray-700 bg-gray-900 p-4 shadow-lg">
					<div className="flex gap-2">
						<input
							type="text"
							placeholder="Type your message..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							className="flex-1 rounded-full border border-gray-600 bg-gray-800 px-4 py-2 text-gray-100 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							onClick={sendMessage}
							className="rounded-full border border-indigo-500 bg-indigo-600 px-6 py-2 text-white shadow-lg transition-colors duration-200 hover:border-indigo-400 hover:bg-indigo-500"
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
