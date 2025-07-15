"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageFallbackProps {
	originalMessage: string;
	improvedMessage: string;
}

export const MessageFallback = ({ originalMessage, improvedMessage }: MessageFallbackProps) => {
	return (
		<div className="min-h-0 flex-1 overflow-hidden">
			<ScrollArea className="h-full">
				<div className="space-y-4 px-6 py-4">
					<Card className="border-0 shadow-none">
						<CardHeader className="px-0 pb-2">
							<CardTitle className="text-sm text-muted-foreground">Original Message</CardTitle>
						</CardHeader>
						<CardContent className="px-0">
							<p className="text-sm">{originalMessage || "No original message available"}</p>
						</CardContent>
					</Card>

					<Card className="border-0 shadow-none">
						<CardHeader className="px-0 pb-2">
							<CardTitle className="text-sm text-muted-foreground">Improved Message</CardTitle>
						</CardHeader>
						<CardContent className="px-0">
							<div className="rounded-md bg-muted/50 p-4">
								<p className="text-sm">{improvedMessage || "No improved message available"}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</ScrollArea>
		</div>
	);
};
