"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { addDays, format, setHours, setMinutes, isBefore } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface DateTimePickerProps {
	onSelect: (date: Date) => void;
}

export function DateTimePicker({ onSelect }: DateTimePickerProps) {
	const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
	const [hour, setHour] = useState<string>("10");
	const [minute, setMinute] = useState<string>("00");
	const [amPm, setAmPm] = useState<string>("AM");
	const [view, setView] = useState<"date" | "time">("date");
	const [error, setError] = useState<string | null>(null);

	// Generate hours for the select dropdown
	const hours = Array.from({ length: 12 }, (_, i) => {
		const hourValue = i + 1;
		return {
			value: hourValue.toString(),
			label: hourValue.toString().padStart(2, "0"),
		};
	});

	// Generate minutes for the select dropdown
	const minutes = Array.from({ length: 12 }, (_, i) => {
		const minuteValue = i * 5;
		const value = minuteValue.toString().padStart(2, "0");
		return {
			value,
			label: value,
		};
	});

	useEffect(() => {
		validateDateTime();
	}, [date, hour, minute, amPm]);

	const validateDateTime = () => {
		if (!date) {
			setError("Please select a date");
			return false;
		}

		const selectedHour =
			Number.parseInt(hour) + (amPm === "PM" && Number.parseInt(hour) !== 12 ? 12 : 0);
		const selectedMinute = Number.parseInt(minute);

		const selectedDateTime = new Date(date);
		selectedDateTime.setHours(selectedHour);
		selectedDateTime.setMinutes(selectedMinute);

		const now = new Date();

		if (isBefore(selectedDateTime, now)) {
			setError("Cannot select a past date or time");
			return false;
		}

		setError(null);
		return true;
	};

	const handleConfirm = () => {
		if (!date || !validateDateTime()) return;

		const hourValue = Number.parseInt(hour);
		const minuteValue = Number.parseInt(minute);

		// Convert 12-hour format to 24-hour format
		const hour24 =
			amPm === "PM" ? (hourValue === 12 ? 12 : hourValue + 12) : hourValue === 12 ? 0 : hourValue;

		const selectedDate = setMinutes(setHours(date, hour24), minuteValue);
		onSelect(selectedDate);
	};

	const toggleView = () => {
		setView(view === "date" ? "time" : "date");
	};

	return (
		<div className="max-w-[420px] overflow-hidden rounded-lg border border-border bg-card shadow-md backdrop-blur-sm">
			<AnimatePresence mode="wait">
				<motion.div
					key={view}
					initial={{ opacity: 0, x: view === "date" ? -20 : 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: view === "date" ? 20 : -20 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
					className="w-full"
				>
					{view === "date" ? (
						<div className="space-y-3 p-3">
							<Calendar
								mode="single"
								selected={date}
								onSelect={setDate}
								disabled={(date) => isBefore(date, new Date().setHours(0, 0, 0, 0))}
								className="w-full rounded-md border-0 [&_.rdp-button:hover]:bg-primary/10 [&_.rdp-button]:h-8 [&_.rdp-button]:w-8 [&_.rdp-caption]:mb-2 [&_.rdp-cell]:p-0 [&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground [&_.rdp-day_selected]:hover:bg-primary [&_.rdp-head_cell]:text-xs [&_.rdp-head_cell]:font-normal [&_.rdp-nav]:px-0 [&_.rdp-nav_button]:h-8 [&_.rdp-nav_button]:w-8 [&_.rdp-nav_button]:transition-colors"
							/>
							<div className="flex items-center justify-between px-1">
								<div className="text-xs font-medium text-muted-foreground">
									{date ? format(date, "EEEE, MMMM do") : "Select a date"}
								</div>
								<Button
									onClick={toggleView}
									variant="ghost"
									size="sm"
									className="h-8 gap-1 hover:bg-primary/10"
								>
									<Clock className="h-4 w-4" />
									<span>Set Time</span>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-4 p-4">
							<div className="mb-4 flex items-center justify-between">
								<Button
									onClick={toggleView}
									variant="ghost"
									size="sm"
									className="h-8 gap-1 hover:bg-primary/10"
								>
									<ChevronLeft className="h-4 w-4" />
									<span>Back to Date</span>
								</Button>
								<div className="text-xs font-medium text-muted-foreground">
									{date ? format(date, "EEEE, MMMM do") : "Select a date"}
								</div>
							</div>

							<div className="flex flex-col space-y-3">
								<div className="text-sm font-medium text-foreground">Select Time</div>
								<div className="flex items-center justify-center gap-2">
									<Select value={hour} onValueChange={setHour}>
										<SelectTrigger className="h-9 w-[65px] border-border/40">
											<SelectValue placeholder="Hour" />
										</SelectTrigger>
										<SelectContent>
											{hours.map((h) => (
												<SelectItem key={h.value} value={h.value}>
													{h.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<span className="text-lg font-medium text-muted-foreground">:</span>

									<Select value={minute} onValueChange={setMinute}>
										<SelectTrigger className="h-9 w-[65px] border-border/40">
											<SelectValue placeholder="Min" />
										</SelectTrigger>
										<SelectContent>
											{minutes.map((m) => (
												<SelectItem key={m.value} value={m.value}>
													{m.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Select value={amPm} onValueChange={setAmPm}>
										<SelectTrigger className="h-9 w-[65px] border-border/40">
											<SelectValue placeholder="AM/PM" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="AM">AM</SelectItem>
											<SelectItem value="PM">PM</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-2 text-sm text-destructive"
									>
										{error}
									</motion.div>
								)}
							</div>
						</div>
					)}
				</motion.div>
			</AnimatePresence>

			<div className="flex justify-end p-4 pt-0">
				<Button onClick={handleConfirm} disabled={!!error || !date} className="w-full">
					Confirm Selection
				</Button>
			</div>
		</div>
	);
}
