"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { LoginForm } from "@/app/(auth)/components/login-form";

import { login, LoginActionState } from "../actions";

export default function Page() {
	const router = useRouter();

	const [email, setEmail] = useState("");

	const [state, formAction] = useActionState<LoginActionState, FormData>(login, {
		status: "idle",
	});

	useEffect(() => {
		if (state.status === "failed") {
			if (state.errors?.general) {
				toast.error(state.errors.general[0]);
			} else {
				toast.error("Invalid credentials!");
			}
		} else if (state.status === "invalid_data") {
			toast.error("Please check the form and try again");
		} else if (state.status === "success") {
			router.refresh();
		}
	}, [state.status, state.errors, router]);

	const handleSubmit = (formData: FormData) => {
		setEmail(formData.get("email") as string);
		formAction(formData);
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
			<div className="w-full max-w-md">
				<LoginForm action={handleSubmit} defaultEmail={email} errors={state.errors} />
				<div className="mt-6 text-center">
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="font-medium text-primary transition-colors hover:text-primary/80"
						>
							Sign up for free
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
