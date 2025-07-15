"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	onBlur?: () => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	disabledDates?: (date: Date) => boolean;
}

export const DateTimePicker = forwardRef<HTMLButtonElement, DateTimePickerProps>(
	(
		{
			value,
			onChange,
			onBlur,
			placeholder = "Select date and time",
			disabled,
			className,
			disabledDates,
		},
		ref,
	) => {
		const [isOpen, setIsOpen] = useState(false);

		function handleDateSelect(date: Date | undefined) {
			if (date && onChange) {
				if (value) {
					const newDate = new Date(date);
					newDate.setHours(value.getHours());
					newDate.setMinutes(value.getMinutes());
					onChange(newDate);
				} else {
					const now = new Date();
					date.setHours(now.getHours());
					date.setMinutes(now.getMinutes());
					onChange(date);
				}
			}
		}

		function handleTimeChange(type: "hour" | "minute" | "ampm", timeValue: string) {
			const currentDate = value || new Date();
			let newDate = new Date(currentDate);

			if (type === "hour") {
				const hour = parseInt(timeValue, 10);
				const currentHour = newDate.getHours();
				const isPM = currentHour >= 12;

				if (isPM) {
					newDate.setHours(hour === 12 ? 12 : hour + 12);
				} else {
					newDate.setHours(hour === 12 ? 0 : hour);
				}
			} else if (type === "minute") {
				newDate.setMinutes(parseInt(timeValue, 10));
			} else if (type === "ampm") {
				const hours = newDate.getHours();
				if (timeValue === "AM" && hours >= 12) {
					newDate.setHours(hours - 12);
				} else if (timeValue === "PM" && hours < 12) {
					newDate.setHours(hours + 12);
				}
			}

			onChange?.(newDate);
		}

		const formatDisplayValue = (date: Date) => {
			return format(date, "MM/dd/yyyy hh:mm aa");
		};

		return (
			<Popover
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open && onBlur) {
						onBlur();
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button
						ref={ref}
						variant="outline"
						disabled={disabled}
						className={cn(
							"w-full justify-start text-left font-normal",
							!value && "text-muted-foreground",
							className,
						)}
					>
						{value ? formatDisplayValue(value) : <span>{placeholder}</span>}
						<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<div className="sm:flex">
						<Calendar
							mode="single"
							selected={value}
							onSelect={handleDateSelect}
							disabled={disabledDates}
							initialFocus
						/>
						<div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
							{/* Hours */}
							<ScrollArea className="w-64 sm:w-auto">
								<div className="flex p-2 sm:flex-col">
									{Array.from({ length: 12 }, (_, i) => i + 1)
										.reverse()
										.map((hour) => (
											<Button
												key={hour}
												size="icon"
												variant={
													value &&
													(value.getHours() % 12 === hour % 12 ||
														(value.getHours() % 12 === 0 && hour === 12))
														? "default"
														: "ghost"
												}
												className="aspect-square shrink-0 sm:w-full"
												onClick={() => handleTimeChange("hour", hour.toString())}
												type="button"
											>
												{hour}
											</Button>
										))}
								</div>
								<ScrollBar orientation="horizontal" className="sm:hidden" />
							</ScrollArea>

							{/* Minutes */}
							<ScrollArea className="w-64 sm:w-auto">
								<div className="flex p-2 sm:flex-col">
									{Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
										<Button
											key={minute}
											size="icon"
											variant={value && value.getMinutes() === minute ? "default" : "ghost"}
											className="aspect-square shrink-0 sm:w-full"
											onClick={() => handleTimeChange("minute", minute.toString())}
											type="button"
										>
											{minute.toString().padStart(2, "0")}
										</Button>
									))}
								</div>
								<ScrollBar orientation="horizontal" className="sm:hidden" />
							</ScrollArea>

							{/* AM/PM */}
							<ScrollArea className="">
								<div className="flex p-2 sm:flex-col">
									{["AM", "PM"].map((ampm) => (
										<Button
											key={ampm}
											size="icon"
											variant={
												value &&
												((ampm === "AM" && value.getHours() < 12) ||
													(ampm === "PM" && value.getHours() >= 12))
													? "default"
													: "ghost"
											}
											className="aspect-square shrink-0 sm:w-full"
											onClick={() => handleTimeChange("ampm", ampm)}
											type="button"
										>
											{ampm}
										</Button>
									))}
								</div>
							</ScrollArea>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		);
	},
);

DateTimePicker.displayName = "DateTimePicker";
