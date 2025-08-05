import { useState, useCallback } from "react";

import { SERVICE_TYPE_VALUES } from "@/app/(dashboard)/admin/service-providers/validations";
import { parseCustomServiceTypes } from "@/lib/utils/formatting";

export interface UseServiceTypeManagementProps {
	initialServiceTypes?: string[];
	onServiceTypesChange?: (serviceTypes: string[]) => void;
}

export const useServiceTypeManagement = ({
	initialServiceTypes = [],
	onServiceTypesChange,
}: UseServiceTypeManagementProps = {}) => {
	const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
		initialServiceTypes.length > 0 ? initialServiceTypes : [],
	);
	const [customServiceTypes, setCustomServiceTypes] = useState<string[]>(() => {
		return initialServiceTypes.filter(
			(type) => !SERVICE_TYPE_VALUES.includes(type as any) && type !== "other",
		);
	});
	const [customServiceInput, setCustomServiceInput] = useState("");
	const [showCustomServiceInput, setShowCustomServiceInput] = useState(() => {
		return customServiceTypes.length > 0;
	});

	const handleServiceTypeClick = useCallback(
		(serviceValue: string) => {
			if (serviceValue === "other") {
				if (!showCustomServiceInput) {
					setShowCustomServiceInput(true);
				} else {
					const newValue = selectedServiceTypes.filter((v) => !customServiceTypes.includes(v));
					setSelectedServiceTypes(newValue);
					setShowCustomServiceInput(false);
					setCustomServiceTypes([]);
					setCustomServiceInput("");
					onServiceTypesChange?.(newValue);
				}
			} else {
				const isSelected = selectedServiceTypes.includes(serviceValue);
				const newValue = isSelected
					? selectedServiceTypes.filter((v) => v !== serviceValue)
					: [...selectedServiceTypes, serviceValue];

				if (newValue.length > 0) {
					setSelectedServiceTypes(newValue);
					onServiceTypesChange?.(newValue);
				}
			}
		},
		[selectedServiceTypes, customServiceTypes, showCustomServiceInput, onServiceTypesChange],
	);

	const addCustomService = useCallback(() => {
		if (customServiceInput.trim()) {
			const serviceTypes = parseCustomServiceTypes(
				customServiceInput,
				customServiceTypes,
				SERVICE_TYPE_VALUES,
			);

			if (serviceTypes.length > 0) {
				const newCustomTypes = [...customServiceTypes, ...serviceTypes];
				const newSelectedTypes = [...selectedServiceTypes, ...serviceTypes];

				setCustomServiceTypes(newCustomTypes);
				setSelectedServiceTypes(newSelectedTypes);
				onServiceTypesChange?.(newSelectedTypes);
			}
			setCustomServiceInput("");
		}
	}, [customServiceInput, customServiceTypes, selectedServiceTypes, onServiceTypesChange]);

	const handleAddCustomService = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (["Enter", "Tab", ","].includes(e.key)) {
				e.preventDefault();
				addCustomService();
			}
		},
		[addCustomService],
	);

	const handleRemoveServiceType = useCallback(
		(serviceType: string) => {
			const newCustomTypes = customServiceTypes.filter((type) => type !== serviceType);
			const newSelectedTypes = selectedServiceTypes.filter((type) => type !== serviceType);

			setCustomServiceTypes(newCustomTypes);
			setSelectedServiceTypes(newSelectedTypes);
			onServiceTypesChange?.(newSelectedTypes);
		},
		[customServiceTypes, selectedServiceTypes, onServiceTypesChange],
	);

	const availableServiceTypes = [
		...SERVICE_TYPE_VALUES.filter(
			(service) => !(service === "other" && customServiceTypes.length > 0),
		),
		...customServiceTypes,
	];

	return {
		selectedServiceTypes,
		customServiceTypes,
		customServiceInput,
		showCustomServiceInput,
		availableServiceTypes,
		setCustomServiceInput,
		handleServiceTypeClick,
		addCustomService,
		handleAddCustomService,
		handleRemoveServiceType,
	};
};
