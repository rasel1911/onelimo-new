"use client";
import { memo } from "react";

import { InfoBadgeProps } from "../../types";

const InfoBadgeComponent = ({ icon, content, positionClasses }: InfoBadgeProps) => {
	return (
		<div className={`${positionClasses}`}>
			<div className="flex items-center space-x-2 rounded-xl border border-border bg-card px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg">
				{icon}
				<p className="max-w-[220px] truncate text-sm text-muted-foreground">{content}</p>
			</div>
		</div>
	);
};

export const InfoBadge = memo(InfoBadgeComponent);
