"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-black text-white">
			{/* Navigation */}
			<nav className="flex items-center space-x-8 border-b border-border bg-black px-6 py-4 text-white">
				<Link href="/" className="text-xl font-bold">
					LR
				</Link>
			</nav>

			{/* Main Content */}
			<main className="container mx-auto max-w-4xl px-6 py-12">
				<h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

				<div className="space-y-8 text-muted-foreground">
					<section>
						<h2 className="mb-4 text-2xl font-semibold text-white">Introduction</h2>
						<p className="mb-4">
							At Onelimo, we take your privacy seriously. This Privacy Policy explains how we
							collect, use, disclose, and safeguard your information when you use our limousine
							booking services.
						</p>
					</section>

					<section>
						<h2 className="mb-4 text-2xl font-semibold text-white">Information We Collect</h2>
						<ul className="list-disc space-y-2 pl-6">
							<li>Personal identification information (Name, email address, phone number)</li>
							<li>Booking information (Pick-up location, destination, date and time)</li>
							<li>Payment information (processed through secure third-party providers)</li>
							<li>Device information and usage data</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-4 text-2xl font-semibold text-white">How We Use Your Information</h2>
						<ul className="list-disc space-y-2 pl-6">
							<li>To process and manage your bookings</li>
							<li>To communicate with you about our services</li>
							<li>To improve our services and user experience</li>
							<li>To comply with legal obligations</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-4 text-2xl font-semibold text-white">Data Security</h2>
						<p className="mb-4">
							We implement appropriate technical and organizational security measures to protect
							your personal information against unauthorized access, alteration, disclosure, or
							destruction.
						</p>
					</section>

					<section>
						<h2 className="mb-4 text-2xl font-semibold text-white">Contact Us</h2>
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
			<footer className="mt-12 flex items-center justify-between border-t border-border bg-black px-6 py-2 text-xs text-muted-foreground">
				<div>© 2025 Onelimo. All rights reserved.</div>
				<div className="flex space-x-6">
					<Link href="/pages/privacy-policy" className="transition-colors hover:text-white">
						Privacy Policy
					</Link>
					<Link href="/pages/terms-of-service" className="transition-colors hover:text-white">
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
