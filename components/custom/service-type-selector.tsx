"use client";

import { Plus, X } from "lucide-react";

import { SERVICE_TYPES } from "@/app/(dashboard)/admin/service-providers/validations";
import { Button } from "@/components/ui/button";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useServiceTypeManagement } from "@/hooks/use-service-type-management";

interface ServiceTypeSelectorProps {
	value: string[];
	onChange: (value: string[]) => void;
	error?: string;
	showLabel?: boolean;
	showDescription?: boolean;
	className?: string;
}

export const ServiceTypeSelector = ({
	value,
	onChange,
	error,
	showLabel = true,
	showDescription = true,
	className = "",
}: ServiceTypeSelectorProps) => {
	const {
		selectedServiceTypes,
		customServiceTypes,
		customServiceInput,
		showCustomServiceInput,
		setCustomServiceInput,
		handleServiceTypeClick,
		addCustomService,
		handleAddCustomService,
		handleRemoveServiceType,
	} = useServiceTypeManagement({
		initialServiceTypes: value,
		onServiceTypesChange: onChange,
	});

	const availableServiceTypes = [
		...SERVICE_TYPES.filter(
			(service) => !(service.value === "other" && customServiceTypes.length > 0),
		),
		...customServiceTypes.map((type) => ({
			value: type,
			label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
		})),
	];

	return (
		<div className={className}>
			{showLabel && <FormLabel>Service Types *</FormLabel>}
			{showDescription && (
				<FormDescription>Select the transportation services you provide</FormDescription>
			)}

			<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
				{availableServiceTypes.map((service) => (
					<Button
						key={service.value}
						type="button"
						variant={
							service.value === "other"
								? showCustomServiceInput
									? "default"
									: "outline"
								: selectedServiceTypes.includes(service.value)
									? "default"
									: "outline"
						}
						className="justify-start"
						onClick={() => handleServiceTypeClick(service.value)}
					>
						{service.label}
					</Button>
				))}
			</div>

			{selectedServiceTypes.length === 0 && (
				<p className="mt-1 text-sm text-destructive">At least one service type is required</p>
			)}

			{error && <p className="mt-1 text-sm text-destructive">{error}</p>}

			{showCustomServiceInput && (
				<div className="mt-2">
					<FormLabel>Specify Service Type</FormLabel>
					<div className="mt-1 flex gap-3">
						<Input
							placeholder="e.g., Executive Van"
							value={customServiceInput}
							onChange={(e) => setCustomServiceInput(e.target.value)}
							onKeyDown={handleAddCustomService}
							onBlur={addCustomService}
						/>
						<Button type="button" variant="outline" onClick={addCustomService} className="shrink-0">
							<Plus className="size-4" />
						</Button>
					</div>
					<FormDescription>
						You can add multiple service types by separating them with a comma.
					</FormDescription>

					{customServiceTypes.length > 0 && (
						<div className="mt-3">
							<div className="flex flex-wrap gap-2">
								{customServiceTypes.map((serviceType, index) => (
									<div
										key={index}
										className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
									>
										<span>
											{serviceType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
										</span>
										<button
											type="button"
											onClick={() => handleRemoveServiceType(serviceType)}
											className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
										>
											<X className="size-3" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
