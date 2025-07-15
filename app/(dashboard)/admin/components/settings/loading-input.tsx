import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingInputProps {
	id: string;
	label: string;
	value: number | string;
	isLoading: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	type?: string;
	min?: string;
	max?: string;
	helpText?: string;
}

export const LoadingInput = ({
	id,
	label,
	value,
	isLoading,
	onChange,
	type = "text",
	min,
	max,
	helpText,
}: LoadingInputProps) => {
	if (isLoading) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-4 w-1/3" />
				<Skeleton className="h-9 w-full" />
				{helpText && <Skeleton className="h-3 w-3/4" />}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<Label htmlFor={id}>{label}</Label>
			<Input id={id} type={type} value={value} onChange={onChange} min={min} max={max} />
			{helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
		</div>
	);
};
