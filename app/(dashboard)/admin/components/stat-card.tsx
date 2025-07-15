import { ArrowRight, Eye, LucideIcon, Settings } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon: LucideIcon;
	href?: string;
	linkText?: string;
}

export const StatCard = ({
	title,
	value,
	description,
	icon: Icon,
	href,
	linkText,
}: StatCardProps) => {
	const getActionIcon = () => {
		if (!linkText) return null;

		if (linkText.toLowerCase().includes("view")) {
			return <Eye className="size-3" />;
		} else if (linkText.toLowerCase().includes("manage")) {
			return <Settings className="size-3" />;
		}
		return <Eye className="size-3" />;
	};

	return (
		<Card className="transition-all duration-200 hover:shadow-md">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="size-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && <p className="text-xs text-muted-foreground">{description}</p>}
			</CardContent>
			{href && linkText && (
				<CardFooter className="pt-2">
					<Link href={href} className="w-full">
						<Button
							variant="ghost"
							className="h-8 w-full justify-between px-3 text-xs text-primary hover:bg-primary/10 hover:text-primary"
						>
							<div className="flex items-center gap-1">
								{getActionIcon()}
								{linkText}
							</div>
							<ArrowRight className="size-3" />
						</Button>
					</Link>
				</CardFooter>
			)}
		</Card>
	);
};
