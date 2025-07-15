interface LocationSuggestionProps {
	locations: string[];
	onSelect: (city: string) => void;
	show: boolean;
}

export const LocationSuggestions = ({ locations, onSelect, show }: LocationSuggestionProps) => {
	if (!show || locations.length === 0) return null;

	return (
		<div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg">
			{locations.map((city, index) => (
				<button
					key={index}
					type="button"
					onClick={() => onSelect(city)}
					className="w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-accent"
				>
					<div className="font-medium">{city}</div>
				</button>
			))}
		</div>
	);
};
