import { ShieldX, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UnauthorizedPage = async () => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
						<ShieldX className="size-8 text-destructive" />
					</div>
					<CardTitle className="text-2xl">Access Denied</CardTitle>
					<CardDescription>
						You don&apos;t have permission to access this page. This area is restricted to
						administrators only.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center text-sm text-muted-foreground">
						If you believe you should have access to this area, please contact your system
						administrator.
					</div>
					<div className="flex flex-col gap-2">
						<Button asChild className="w-full">
							<Link href="/">
								<Home className="mr-2 size-4" />
								Go to Home
							</Link>
						</Button>
						<Button variant="outline" asChild className="w-full">
							<Link href="javascript:history.back()">
								<ArrowLeft className="mr-2 size-4" />
								Go Back
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default UnauthorizedPage;
