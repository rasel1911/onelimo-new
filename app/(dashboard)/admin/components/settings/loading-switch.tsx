import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

interface LoadingSwitchProps {
	label: string;
	description?: string;
	checked: boolean;
	isLoading: boolean;
	onCheckedChange: (checked: boolean) => void;
	icon?: React.ReactNode;
}

export const LoadingSwitch = ({
	label,
	description,
	checked,
	isLoading,
	onCheckedChange,
	icon,
}: LoadingSwitchProps) => {
	if (isLoading) {
		return (
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						{icon}
						<Skeleton className="h-4 w-32" />
					</div>
					{description && <Skeleton className="h-3 w-48" />}
				</div>
				<Skeleton className="h-6 w-11 rounded-full" />
			</div>
		);
	}

	return (
		<div className="flex items-center justify-between">
			<div className="space-y-0.5">
				<Label className={icon ? "flex items-center gap-2" : ""}>
					{icon}
					{label}
				</Label>
				{description && <p className="text-xs text-muted-foreground">{description}</p>}
			</div>
			<Switch checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
};
