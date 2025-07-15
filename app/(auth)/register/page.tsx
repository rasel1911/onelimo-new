"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { SignupForm } from "@/app/(auth)/components/signup-form";

import { register, RegisterActionState } from "../actions";

export default function Page() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [state, formAction] = useActionState<RegisterActionState, FormData>(register, {
		status: "idle",
	});

	useEffect(() => {
		if (state.status === "user_exists") {
			if (state.errors?.email || state.errors?.phone) {
				toast.error("Account already exists");
			}
		} else if (state.status === "failed") {
			if (state.errors?.general) {
				toast.error(state.errors.general[0]);
			}
		} else if (state.status === "invalid_data") {
			toast.error("Please check the form and try again");
		} else if (state.status === "success") {
			toast.success("Account created successfully");
			router.refresh();
		}
	}, [state, router]);

	const handleSubmit = (formData: FormData) => {
		setEmail(formData.get("email") as string);
		formAction(formData);
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
			<div className="w-full max-w-md">
				<SignupForm action={handleSubmit} defaultEmail={email} errors={state.errors} />
				<div className="mt-6 text-center">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-medium text-primary transition-colors hover:text-primary/80"
						>
							Sign in instead
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
