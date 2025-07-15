"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
	return (
		<div className="min-h-screen bg-black text-white">
			{/* Navigation */}
			<nav className="bg-black text-white py-4 px-6 flex items-center space-x-8 border-b border-border">
				<Link href="/" className="text-xl font-bold">
					LR
				</Link>
			</nav>

			{/* Main Content */}
			<main className="container mx-auto px-6 py-12 max-w-4xl">
				<h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

				<div className="space-y-8 text-muted-foreground">
					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Agreement to Terms</h2>
						<p className="mb-4">
							By accessing or using Onelimo&apos;s services, you agree to be bound by these Terms of Service. If you
							disagree with any part of the terms, you may not access our services.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Service Description</h2>
						<p className="mb-4">
							Onelimo provides a platform for booking luxury transportation services. We facilitate the connection
							between passengers and professional drivers through our booking system.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">User Responsibilities</h2>
						<ul className="list-disc pl-6 space-y-2">
							<li>Provide accurate and complete information when making bookings</li>
							<li>Maintain the security of your account credentials</li>
							<li>Comply with all applicable laws and regulations</li>
							<li>Treat drivers and vehicles with respect</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Booking and Cancellation</h2>
						<p className="mb-4">
							All bookings are subject to availability. Cancellation policies vary based on the service type and timing.
							Please review specific booking terms at the time of reservation.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
						<p className="mb-4">
							Onelimo shall not be liable for indirect, incidental, special, exemplary, punitive, or consequential
							damages, including lost profits, arising from your use of our services.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
						<p className="mb-4">
							For questions about these Terms of Service, please contact us at{" "}
							<a href="mailto:contact@onelimo.com" className="text-primary hover:underline">
								contact@onelimo.com
							</a>
						</p>
					</section>
				</div>
			</main>

			{/* Footer */}
			<footer className="bg-black border-t border-border py-2 px-6 flex justify-between items-center text-xs text-muted-foreground mt-12">
				<div>© 2025 Onelimo. All rights reserved.</div>
				<div className="flex space-x-6">
					<Link href="/pages/privacy-policy" className="hover:text-white transition-colors">
						Privacy Policy
					</Link>
					<Link href="/pages/terms-of-service" className="hover:text-white transition-colors">
						Terms of Service
					</Link>
					<a href="mailto:contact@onelimo.com" className="hover:text-white transition-colors">
						Contact
					</a>
				</div>
			</footer>
		</div>
	);
}
