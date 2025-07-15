"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Input } from "@/components/ui/input";

interface LocationSearchProps {
	onSearchChange: (query: string) => void;
}

const LocationSearch = ({ onSearchChange }: LocationSearchProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

	useEffect(() => {
		onSearchChange(debouncedSearchQuery);
	}, [debouncedSearchQuery, onSearchChange]);

	return (
		<div className="relative flex-1">
			<Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search locations..."
				className="pl-8"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
			/>
		</div>
	);
};

export default LocationSearch;
