"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

interface ServiceProviderSearchProps {
	onSearchAction: (query: string) => void;
	placeholder?: string;
}

export const ServiceProviderSearch = ({
	onSearchAction,
	placeholder = "Search providers...",
}: ServiceProviderSearchProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		onSearchAction(value);
	};

	return (
		<div className="relative flex-1">
			<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				placeholder={placeholder}
				value={searchQuery}
				onChange={(e) => handleSearchChange(e.target.value)}
				className="pl-10"
			/>
		</div>
	);
};
