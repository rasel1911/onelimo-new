"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAreaCoverage } from "@/hooks/use-area-coverage";

interface AreaCoverageInputProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	label?: string;
	description?: string;
	emptyStateText?: string;
	className?: string;
}

export const AreaCoverageInput = ({
	value,
	onChange,
	placeholder = "e.g. SW1A 1AA",
	label = "Service Areas",
	description,
	emptyStateText = "No areas added. If none specified, all areas in the location will be covered.",
	className = "",
}: AreaCoverageInputProps) => {
	const { areaCovered, areaInput, setAreaInput, addArea, handleAddArea, removeArea } =
		useAreaCoverage({
			initialAreas: value,
			onAreasChange: onChange,
		});

	return (
		<div className={className}>
			<FormLabel htmlFor="area-coverage">{label}</FormLabel>
			{description && <FormDescription>{description}</FormDescription>}

			<div className="flex gap-2">
				<Input
					id="area-coverage"
					placeholder={placeholder}
					value={areaInput}
					onChange={(e) => setAreaInput(e.target.value)}
					onKeyDown={handleAddArea}
					onBlur={addArea}
				/>
				<Button type="button" variant="outline" onClick={addArea} className="shrink-0">
					<Plus className="size-4" />
				</Button>
			</div>

			{areaCovered.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-2">
					{areaCovered.map((area, index) => (
						<div
							key={index}
							className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
						>
							<span>{area}</span>
							<button
								type="button"
								onClick={() => removeArea(area)}
								className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
							>
								<X className="size-3" />
							</button>
						</div>
					))}
				</div>
			)}

			{areaCovered.length === 0 && (
				<p className="mt-2 text-sm text-muted-foreground">{emptyStateText}</p>
			)}
		</div>
	);
};
