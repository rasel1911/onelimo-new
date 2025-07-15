"use client";

import { Calendar, MessageCircle, ArrowRight, Sparkles, Settings } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useUserData } from "@/hooks/use-user-data";

export default function LandingPage() {
	const { user, isLoading } = useUserData();
	const isAdmin = user?.role === "admin";

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
			{/* Header */}
			<header className="absolute inset-x-0 top-0 z-10 p-6">
				<div className="container mx-auto flex items-center justify-between">
					<div></div>
					{!isLoading && isAdmin && (
						<Link href="/admin">
							<Button
								size="sm"
								variant="secondary"
								className="group relative overflow-hidden rounded-md px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
							>
								<Settings className="mr-2 size-4" />
								<span>Admin Dashboard</span>
								<ArrowRight className="ml-2 size-3 transition-transform group-hover:translate-x-1" />
							</Button>
						</Link>
					)}
				</div>
			</header>

			{/* Hero Section */}
			<div className="container mx-auto px-6 py-20">
				<div className="mx-auto max-w-4xl space-y-8 text-center">
					<div className="mb-16 flex justify-center">
						<div className="relative">
							<div className="relative bg-gradient-to-r from-primary/90 via-primary to-primary/90 bg-clip-text text-6xl font-black tracking-tight text-transparent md:text-5xl">
								Onelimo
							</div>
							<div className="absolute -bottom-1 left-1/2 h-0.5 w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>
						</div>
					</div>

					{/* Main Heading */}
					<h1 className="text-6xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
						Premium Rides,
						<br />
						<span className="relative inline-block">
							<span className="relative text-primary">Simplified</span>
						</span>
					</h1>

					{/* Subtitle */}
					<p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
						Experience luxury transportation with our intelligent booking system. Choose your
						preferred way to book your next journey.
					</p>

					{/* Action Buttons - Enhanced for better UX */}
					<div className="flex flex-col items-center justify-center gap-8 pt-16 sm:flex-row">
						{/* Form Booking Button */}
						<Link href="/booking-request-form">
							<Button
								size="lg"
								className="hover:shadow-3xl group relative w-full overflow-hidden rounded-md bg-gradient-to-r from-primary to-primary/80 px-12 py-10 text-2xl font-semibold text-primary-foreground shadow-2xl transition-all duration-500 hover:scale-105 sm:w-auto"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<Calendar className="mr-4 size-7" />
								<span className="relative">Book with Form</span>
								<ArrowRight className="ml-4 size-6 transition-transform group-hover:translate-x-2" />
							</Button>
						</Link>

						{/* AI Concierge Button */}
						<Link href="/concierge">
							<Button
								size="lg"
								variant="outline"
								className="group relative w-full overflow-hidden rounded-md border border-primary/60 bg-background/80 px-12 py-10 text-2xl font-semibold backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-primary hover:bg-primary/5 hover:shadow-2xl sm:w-auto"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<Sparkles className="mr-4 size-7 text-primary transition-transform group-hover:rotate-12" />
								<span className="relative text-primary">AI Concierge</span>
							</Button>
						</Link>
					</div>

					{/* Features */}
					<div className="mx-auto grid max-w-3xl gap-8 pt-24 md:grid-cols-3">
						<div className="group space-y-4 text-center transition-transform hover:scale-105">
							<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 transition-all group-hover:shadow-lg">
								<Calendar className="size-8 text-primary" />
							</div>
							<h3 className="text-xl font-semibold">Quick Booking</h3>
							<p className="text-muted-foreground">
								Fill a simple form and book your ride in seconds
							</p>
						</div>

						<div className="group space-y-4 text-center transition-transform hover:scale-105">
							<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 transition-all group-hover:shadow-lg">
								<Sparkles className="size-8 text-primary" />
							</div>
							<h3 className="text-xl font-semibold">AI Assistant</h3>
							<p className="text-muted-foreground">
								Chat with our AI to get personalized recommendations
							</p>
						</div>

						<div className="group space-y-4 text-center transition-transform hover:scale-105">
							<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 transition-all group-hover:shadow-lg">
								<MessageCircle className="size-8 text-primary" />
							</div>
							<h3 className="text-xl font-semibold">24/7 Support</h3>
							<p className="text-muted-foreground">Get help whenever you need it, day or night</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="border-t border-border/50 py-8">
				<div className="container mx-auto px-6">
					<div className="flex flex-col items-center justify-between space-y-4 text-sm text-muted-foreground sm:flex-row sm:space-y-0">
						<div>© 2025 OneLimo. All rights reserved.</div>
						<div className="flex space-x-6">
							<Link
								href="/pages/privacy-policy"
								className="transition-colors hover:text-foreground"
							>
								Privacy Policy
							</Link>
							<Link
								href="/pages/terms-of-service"
								className="transition-colors hover:text-foreground"
							>
								Terms of Service
							</Link>
							<a
								href="mailto:contact@onelimo.com"
								className="transition-colors hover:text-foreground"
							>
								Contact
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
