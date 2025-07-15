"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
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
				<h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

				<div className="space-y-8 text-muted-foreground">
					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
						<p className="mb-4">
							At Onelimo, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
							and safeguard your information when you use our limousine booking services.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
						<ul className="list-disc pl-6 space-y-2">
							<li>Personal identification information (Name, email address, phone number)</li>
							<li>Booking information (Pick-up location, destination, date and time)</li>
							<li>Payment information (processed through secure third-party providers)</li>
							<li>Device information and usage data</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
						<ul className="list-disc pl-6 space-y-2">
							<li>To process and manage your bookings</li>
							<li>To communicate with you about our services</li>
							<li>To improve our services and user experience</li>
							<li>To comply with legal obligations</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
						<p className="mb-4">
							We implement appropriate technical and organizational security measures to protect your personal
							information against unauthorized access, alteration, disclosure, or destruction.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
						<p className="mb-4">
							If you have any questions about this Privacy Policy, please contact us at{" "}
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
