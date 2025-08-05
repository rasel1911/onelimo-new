"use client";

import { Sparkles, Wand2, ArrowRight, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowQuote } from "@/db/schema/workflow/workflowQuote.schema";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
	quote: WorkflowQuote;
	onSelect: (quote: WorkflowQuote) => void;
}

export const QuoteCard = ({ quote, onSelect }: QuoteCardProps) => {
	return (
		<Card
			className={cn(
				"group relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
				quote.isRecommended && "ring-2 ring-primary/20",
			)}
			onClick={() => onSelect(quote)}
		>
			{quote.isRecommended && (
				<div className="absolute -top-2 left-16 z-10">
					<Badge className="bg-primary text-primary-foreground">
						<Sparkles className="mr-1 size-3" />
						Recommended
					</Badge>
				</div>
			)}
			{quote.isSelectedByAi && (
				<div className="absolute -top-2 left-4 z-10">
					<Badge className="bg-teal-500 text-primary-foreground">
						<Wand2 className="mr-1 size-4" />
					</Badge>
				</div>
			)}

			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-xl">{quote.providerName}</CardTitle>
					<div className="flex items-center gap-2">
						<span className="text-3xl font-bold">£{quote.amount}</span>
					</div>
				</div>
				<CardDescription className="text-sm">
					Quote ID: {quote.quoteId.slice(0, 8)}
					{quote.rating && <span className="ml-2">• Match: {quote.rating}/100</span>}
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Notes */}
				{quote.notes && (
					<div className="relative">
						<div className="relative rounded-r-lg border-l-4 border-primary bg-primary/10 p-4 shadow-sm">
							<div className="absolute right-2 top-2 size-3 rounded-full bg-primary shadow-sm"></div>
							<div className="mb-1 text-sm font-semibold text-primary">Notes:</div>
							<p className="text-sm text-primary">{quote.notes}</p>
						</div>
					</div>
				)}

				{/* Key Points */}
				{quote.strengths && quote.strengths.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Lightbulb className="size-4" />
							<span>Strengths</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{quote.strengths.map((point, index) => (
								<Badge key={index} variant="secondary" className="text-xs">
									{point.replace(/\.$/, "")}
								</Badge>
							))}
						</div>
					</div>
				)}

				<Button className="mt-6 w-full transition-colors group-hover:bg-primary/90" size="lg">
					Select this quote
					<ArrowRight className="ml-2 size-4" />
				</Button>
			</CardContent>
		</Card>
	);
};
