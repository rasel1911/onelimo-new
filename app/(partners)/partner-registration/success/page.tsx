"use client";

import { Check, Clock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const PartnerRegistrationSuccessPage = () => {
	return (
		<div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-16">
			<Card className="max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
						<Check className="size-8 text-green-600" />
					</div>
					<CardTitle className="text-2xl font-semibold">Registration Successful</CardTitle>
					<CardDescription className="text-base">
						Your application has been submitted
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-center">
					<p>
						Thank you for registering with Onelimo. Your application is now pending review by our
						team.
					</p>

					<div className="mt-2 rounded-lg border bg-muted/50 p-4">
						<div className="flex items-center justify-center gap-2 text-muted-foreground">
							<Clock className="size-4" />
							<span className="text-sm">Review process: 1-2 business days</span>
						</div>
					</div>

					<p className="text-sm text-muted-foreground">
						You will receive an email notification once your account has been approved with
						instructions.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<Link href="/" className="w-full">
						<Button className="w-full">Return to Homepage</Button>
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
};

export default PartnerRegistrationSuccessPage;
