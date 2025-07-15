"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AnalysisDisplay } from "./analysis-display";
import { MessageComparison } from "./message-comparison";

interface MessageTabsProps {
	analysis: any;
	originalMessage: string;
	improvedMessage: string;
	cleanedMessage: string;
}

export const MessageTabs = ({
	analysis,
	originalMessage,
	improvedMessage,
	cleanedMessage,
}: MessageTabsProps) => {
	return (
		<Tabs defaultValue="analysis" className="flex min-h-0 flex-1 flex-col">
			<div className="shrink-0 border-b bg-muted/50 px-6 py-3">
				<TabsList className="grid h-9 w-full grid-cols-3">
					<TabsTrigger value="analysis" className="text-xs">
						Analysis
					</TabsTrigger>
					<TabsTrigger value="messages" className="text-xs">
						Comparison
					</TabsTrigger>
					<TabsTrigger value="enhanced" className="text-xs">
						Enhanced
					</TabsTrigger>
				</TabsList>
			</div>

			<div className="min-h-0 flex-1 overflow-hidden">
				<TabsContent
					value="analysis"
					className="m-0 h-full p-0 data-[state=active]:flex data-[state=active]:flex-col"
				>
					<ScrollArea className="h-full flex-1">
						<div className="px-6 py-4">
							<AnalysisDisplay analysis={analysis} />
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent
					value="messages"
					className="m-0 h-full p-0 data-[state=active]:flex data-[state=active]:flex-col"
				>
					<ScrollArea className="h-full flex-1">
						<div className="px-6 py-4">
							<MessageComparison
								originalMessage={originalMessage}
								cleanedMessage={cleanedMessage}
								contactDetailsDetected={analysis.contactDetailsDetected || false}
							/>
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent
					value="enhanced"
					className="m-0 h-full p-0 data-[state=active]:flex data-[state=active]:flex-col"
				>
					<ScrollArea className="h-full flex-1">
						<div className="px-6 py-4">
							<Card className="border-0 shadow-none">
								<CardHeader className="px-0 pb-3">
									<CardTitle className="text-base">Enhanced Message</CardTitle>
								</CardHeader>
								<CardContent className="px-0">
									<div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed">
										{analysis.refinedMessage ||
											analysis.enhanced ||
											improvedMessage ||
											"No enhanced message available"}
									</div>
								</CardContent>
							</Card>
						</div>
					</ScrollArea>
				</TabsContent>
			</div>
		</Tabs>
	);
};
