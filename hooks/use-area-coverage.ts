import { useState, useCallback } from "react";

export interface UseAreaCoverageProps {
	initialAreas?: string[];
	onAreasChange?: (areas: string[]) => void;
}

export const useAreaCoverage = ({
	initialAreas = [],
	onAreasChange,
}: UseAreaCoverageProps = {}) => {
	const [areaCovered, setAreaCovered] = useState<string[]>(initialAreas);
	const [areaInput, setAreaInput] = useState("");

	const addArea = useCallback(() => {
		if (areaInput.trim()) {
			const area = areaInput.trim().toUpperCase();
			if (!areaCovered.includes(area)) {
				const newAreas = [...areaCovered, area];
				setAreaCovered(newAreas);
				onAreasChange?.(newAreas);
			}
			setAreaInput("");
		}
	}, [areaInput, areaCovered, onAreasChange]);

	const handleAddArea = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (["Enter", "Tab", ","].includes(e.key)) {
				e.preventDefault();
				addArea();
			}
		},
		[addArea],
	);

	const removeArea = useCallback(
		(areaToRemove: string) => {
			const newAreas = areaCovered.filter((area) => area !== areaToRemove);
			setAreaCovered(newAreas);
			onAreasChange?.(newAreas);
		},
		[areaCovered, onAreasChange],
	);

	const removeAreaByIndex = useCallback(
		(index: number) => {
			const newAreas = areaCovered.filter((_, i) => i !== index);
			setAreaCovered(newAreas);
			onAreasChange?.(newAreas);
		},
		[areaCovered, onAreasChange],
	);

	return {
		areaCovered,
		areaInput,
		setAreaInput,
		addArea,
		handleAddArea,
		removeArea,
		removeAreaByIndex,
	};
};
