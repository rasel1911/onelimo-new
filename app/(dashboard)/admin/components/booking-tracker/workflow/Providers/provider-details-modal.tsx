"use client";

import {
	CheckCircle,
	XCircle,
	Clock,
	Star,
	MapPin,
	Phone,
	Mail,
	MessageSquare,
	DollarSign,
	Calendar,
	Timer,
	AlertCircle,
	User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WorkflowProvider } from "@/lib/types/workflow-tracking";

interface ProviderDetailsModalProps {
	isOpen: boolean;
	onCloseAction: () => void;
	data: WorkflowProvider[];
}

const getStatusIcon = (hasResponded: boolean, responseStatus?: string) => {
	if (!hasResponded) {
		return <Clock className="size-4 text-muted-foreground" />;
	}

	switch (responseStatus) {
		case "accepted":
			return <CheckCircle className="size-4 text-green-500" />;
		case "declined":
			return <XCircle className="size-4 text-red-500" />;
		default:
			return <AlertCircle className="size-4 text-yellow-500" />;
	}
};

const getStatusBadge = (hasResponded: boolean, responseStatus?: string) => {
	if (!hasResponded) {
		return (
			<Badge variant="outline" className="text-muted-foreground">
				Pending
			</Badge>
		);
	}

	switch (responseStatus) {
		case "accepted":
			return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
		case "declined":
			return <Badge variant="destructive">Declined</Badge>;
		default:
			return <Badge variant="secondary">Responded</Badge>;
	}
};

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: "GBP",
	}).format(amount / 100);
};

const formatDateTime = (dateString: string) => {
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(dateString));
};

export function ProviderDetailsModal({ isOpen, onCloseAction, data }: ProviderDetailsModalProps) {
	if (!data || data.length === 0) {
		return (
			<Dialog open={isOpen} onOpenChange={onCloseAction}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Service Providers</DialogTitle>
						<DialogDescription>No provider data available</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		);
	}

	const respondedProviders = data.filter((p) => p.hasResponded);
	const acceptedProviders = data.filter((p) => p.responseStatus === "accepted");
	const declinedProviders = data.filter((p) => p.responseStatus === "declined");

	return (
		<Dialog open={isOpen} onOpenChange={onCloseAction}>
			<DialogContent className="max-h-[90vh] sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="size-5" />
						Service Provider Responses
					</DialogTitle>
					<DialogDescription>
						{data.length} provider{data.length !== 1 ? "s" : ""} contacted •{" "}
						{respondedProviders.length} response{respondedProviders.length !== 1 ? "s" : ""}{" "}
						received
					</DialogDescription>
				</DialogHeader>

				{/* Summary Stats */}
				<div className="mb-4 grid grid-cols-3 gap-4">
					<Card className="p-3">
						<div className="flex items-center justify-center space-x-2">
							<CheckCircle className="size-4 text-green-500" />
							<div className="text-center">
								<div className="text-lg font-semibold text-green-600">
									{acceptedProviders.length}
								</div>
								<div className="text-xs text-muted-foreground">Accepted</div>
							</div>
						</div>
					</Card>
					<Card className="p-3">
						<div className="flex items-center justify-center space-x-2">
							<XCircle className="size-4 text-red-500" />
							<div className="text-center">
								<div className="text-lg font-semibold text-red-600">{declinedProviders.length}</div>
								<div className="text-xs text-muted-foreground">Declined</div>
							</div>
						</div>
					</Card>
					<Card className="p-3">
						<div className="flex items-center justify-center space-x-2">
							<Clock className="size-4 text-muted-foreground" />
							<div className="text-center">
								<div className="text-lg font-semibold text-muted-foreground">
									{data.length - respondedProviders.length}
								</div>
								<div className="text-xs text-muted-foreground">Pending</div>
							</div>
						</div>
					</Card>
				</div>

				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-4">
						{data.map((provider, index) => (
							<Card key={provider.id} className={`overflow-hidden transition-all hover:shadow-md`}>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h3 className="text-lg font-semibold">{provider.providerName}</h3>
												{getStatusIcon(provider.hasResponded, provider.responseStatus)}
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												{provider.providerEmail && (
													<div className="flex items-center gap-1">
														<Mail className="size-3" />
														<span>{provider.providerEmail}</span>
													</div>
												)}
												{provider.providerPhone && (
													<div className="flex items-center gap-1">
														<Phone className="size-3" />
														<span>{provider.providerPhone}</span>
													</div>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											{provider.rating && (
												<Badge variant="secondary" className="flex items-center gap-1">
													<Star className="size-3 fill-current" />
													{provider.rating}
												</Badge>
											)}
											{getStatusBadge(provider.hasResponded, provider.responseStatus)}
										</div>
									</div>
								</CardHeader>

								<CardContent className="pt-0">
									<div className="grid grid-cols-1">
										{/* Response Information */}
										<div className="space-y-3">
											<h4 className="flex items-center gap-1 text-sm font-medium">
												<Timer className="size-4" />
												Response Details
											</h4>
											{provider.hasResponded ? (
												<div className="space-y-2 text-sm">
													{provider.responseTime && (
														<div className="flex justify-between">
															<span className="text-muted-foreground">Responded at:</span>
															<span className="flex items-center gap-1 font-medium">
																<Calendar className="size-3" />

																{/* FIXME: It should be responded at */}
																{formatDateTime(provider.responseTime)}
															</span>
														</div>
													)}
													{provider.hasQuoted && provider.quoteAmount && (
														<div className="flex justify-between">
															<span className="text-muted-foreground">Quote:</span>
															<span className="flex items-center gap-1 font-semibold text-green-600">
																{formatCurrency(provider.quoteAmount)}
															</span>
														</div>
													)}
													{provider.estimatedTime && (
														<div className="flex justify-between">
															<span className="text-muted-foreground">ETA:</span>
															<span className="font-medium">{provider.estimatedTime}</span>
														</div>
													)}
												</div>
											) : (
												<div className="text-sm italic text-muted-foreground">
													Awaiting response...
												</div>
											)}
										</div>
									</div>

									{/* Response Notes */}
									{provider.hasResponded &&
										(provider.responseNotes || provider.refinedResponse) && (
											<>
												<Separator className="my-4" />
												<div className="space-y-2">
													<h4 className="text-sm font-medium">Response Notes</h4>
													<div className="rounded-lg bg-muted/80 p-3">
														<p className="text-sm">
															{provider.refinedResponse ||
																provider.responseNotes ||
																"No additional notes provided."}
														</p>
													</div>
												</div>
											</>
										)}
								</CardContent>

								{index < data.length - 1 && <Separator className="mt-4" />}
							</Card>
						))}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
