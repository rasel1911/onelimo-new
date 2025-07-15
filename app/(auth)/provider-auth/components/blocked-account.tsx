"use client";

import { ShieldX, Mail, Clock } from "lucide-react";
import React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface BlockedAccountProps {
	onRequestResetAction: () => void;
	providerName?: string;
	blockedAt?: Date;
	isRequestingReset?: boolean;
}

export const BlockedAccount = ({
	onRequestResetAction,
	providerName = "Service Provider",
	blockedAt,
	isRequestingReset = false,
}: BlockedAccountProps) => {
	const formatBlockedTime = (date?: Date) => {
		if (!date) return "";
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(date);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
						<ShieldX className="size-8 text-destructive" />
					</div>
					<h1 className="text-2xl font-bold text-foreground">Account Blocked</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						{providerName}, your account has been temporarily blocked due to multiple failed PIN
						attempts.
					</p>
				</div>

				<div className="space-y-6">
					<Alert variant="destructive">
						<ShieldX className="size-4" />
						<AlertDescription>
							Your account was blocked after 3 consecutive failed PIN attempts for security reasons.
							{blockedAt && (
								<div className="mt-2 text-sm">Blocked on: {formatBlockedTime(blockedAt)}</div>
							)}
						</AlertDescription>
					</Alert>

					<div className="rounded-lg border bg-muted/50 p-4">
						<div className="flex items-start space-x-3">
							<Clock className="mt-0.5 size-5 text-muted-foreground" />
							<div>
								<h3 className="font-medium text-foreground">What happens next?</h3>
								<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
									<li>• Request a PIN reset using the button below</li>
									<li>• Check your email for reset instructions</li>
									<li>• Follow the secure link to set a new PIN</li>
									<li>• Your account will be unblocked once PIN is reset</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="space-y-4 text-center">
						<Button
							onClick={onRequestResetAction}
							disabled={isRequestingReset}
							className="w-full"
							size="lg"
						>
							<Mail className="mr-2 size-4" />
							{isRequestingReset ? "Sending Reset Email..." : "Request PIN Reset"}
						</Button>

						<p className="text-xs text-muted-foreground">
							A secure reset link will be sent to your registered email address
						</p>
					</div>
				</div>

				<div className="text-center">
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
						<h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
							Security Notice
						</h4>
						<p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
							This security measure protects your account and booking data from unauthorized access.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
