"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAgentStore } from "@/app/(booking)/store/ai-concierge-store";
import { useUserData } from "@/hooks/use-user-data";

import { BookingWindow } from "./components/interactive-window/booking-window";

const ChatPanel = dynamic(() => import("./components/chat-window").then((m) => m.Chat), {
	ssr: false,
	loading: () => <div className="w-2/5 border-l border-border bg-card" />,
});

export default function OnelimoConciergePage() {
	const { setUserData } = useAgentStore();
	const [conversationId] = useState(() => `main-conversation-${Date.now()}`);
	const { user, isLoading, error, isAuthenticated } = useUserData();

	useEffect(() => {
		if (user) {
			setUserData({
				name: user.name,
				email: user.email,
				phone: user.phone,
			});
		}
	}, [user, setUserData]);

	if (!isAuthenticated && !isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-black text-white">
				<div className="text-center">
					<div className="mb-4 text-6xl">🚗</div>
					<h1 className="mb-4 text-3xl font-bold">Welcome to Onelimo</h1>
					<p className="mb-6 text-muted-foreground">
						Please login to start booking your luxury car
					</p>
					<Link
						href="/login"
						className="inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Login to Continue
					</Link>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center bg-black text-white">
				<div className="text-center">
					<p className="mb-4 text-red-400">Error loading profile: {error}</p>
					<Link href="/login" className="text-primary hover:underline">
						Please login again
					</Link>
				</div>
			</div>
		);
	}

	return isLoading ? (
		<div className="flex h-screen items-center justify-center bg-black text-white">
			<Loader2 className="size-4 animate-spin" /> Initializing...
		</div>
	) : (
		<div className="flex h-screen flex-col bg-black text-white">
			<header className="flex items-center justify-between border-b border-border bg-black px-6 py-3">
				<div className="text-sm text-muted-foreground">Hi, {user?.name}!</div>
			</header>

			<div className="flex flex-1 overflow-hidden">
				<div className="flex flex-1 items-center justify-center overflow-y-auto">
					<div className="w-full max-w-4xl p-6">
						<BookingWindow conversationId={conversationId} />
					</div>
				</div>
				<ChatPanel conversationId={conversationId} />
			</div>

			<footer className="flex w-full items-center justify-between border-t border-border bg-black px-6 py-2 text-xs text-muted-foreground">
				<div>© 2025 Onelimo. All rights reserved.</div>
				<div className="flex space-x-6">
					<Link href="/privacy-policy" className="transition-colors hover:text-white">
						Privacy Policy
					</Link>
					<Link href="/terms-of-service" className="transition-colors hover:text-white">
						Terms of Service
					</Link>
					<a href="mailto:contact@onelimo.com" className="transition-colors hover:text-white">
						Contact
					</a>
				</div>
			</footer>
		</div>
	);
}
