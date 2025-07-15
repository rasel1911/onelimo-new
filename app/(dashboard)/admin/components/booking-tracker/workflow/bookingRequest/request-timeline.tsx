"use client";

import { formatDate } from "@/lib/utils/formatting";

interface RequestTimelineProps {
	booking: {
		createdAt: string;
		updatedAt: string;
	};
}

export function RequestTimeline({ booking }: RequestTimelineProps) {
	return (
		<div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/30">
			<h3 className="mb-4 text-base font-medium text-slate-800 dark:text-slate-200">
				Request Timeline
			</h3>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-white/80 p-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60">
					<div className="flex items-center space-x-2">
						<div className="size-2 rounded-full bg-emerald-400"></div>
						<span className="text-xs text-slate-600 dark:text-slate-400">Created</span>
					</div>
					<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
						{formatDate(booking.createdAt)}
					</span>
				</div>
				<div className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-white/80 p-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/60">
					<div className="flex items-center space-x-2">
						<div className="size-2 rounded-full bg-blue-400"></div>
						<span className="text-xs text-slate-600 dark:text-slate-400">Updated</span>
					</div>
					<span className="text-sm font-medium text-slate-900 dark:text-slate-100">
						{formatDate(booking.updatedAt)}
					</span>
				</div>
			</div>
		</div>
	);
}
