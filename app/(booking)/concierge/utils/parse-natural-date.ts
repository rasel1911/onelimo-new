import { isValid, parseISO } from "date-fns";

/**
 * @description
 * Parse a natural language date/time string into a JavaScript Date.
 * @param input - The natural language date/time string to parse.
 * @returns The parsed Date or null if parsing fails.
 * @example
 * parseNaturalLanguageDate("today at 3pm") // returns today's date at 3pm
 * parseNaturalLanguageDate("tomorrow at 10am") // returns tomorrow's date at 10am
 */
export const parseNaturalLanguageDate = (input: string): Date | null => {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	// Normalise
	const normalized = input.toLowerCase().trim();

	// TODAY
	if (normalized.includes("today")) {
		return handleRelativeDay(normalized, today);
	}

	// TOMORROW
	if (normalized.includes("tomorrow")) {
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		return handleRelativeDay(normalized, tomorrow);
	}

	// next / this DAY_OF_WEEK
	const dayNames = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	] as const;

	const dayMatch = normalized.match(
		/(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
	);
	if (dayMatch) {
		const [, modifier, dayName] = dayMatch;
		const targetDay = dayNames.indexOf(dayName as (typeof dayNames)[number]);
		const currentDay = now.getDay();

		let daysToAdd = targetDay - currentDay;
		if (modifier === "next" && daysToAdd <= 0) daysToAdd += 7;
		if (modifier === "this" && daysToAdd < 0) daysToAdd += 7;

		const targetDate = new Date(today);
		targetDate.setDate(targetDate.getDate() + daysToAdd);

		applyTimePart(normalized, targetDate);
		return targetDate;
	}

	// in X hours/minutes
	const relativeMatch = normalized.match(/in\s+(\d+)\s+(hour|hr|minute|min)s?/i);
	if (relativeMatch) {
		const amount = parseInt(relativeMatch[1]);
		const unit = relativeMatch[2];
		const result = new Date(now);
		if (unit.startsWith("hour") || unit === "hr") result.setHours(result.getHours() + amount);
		else result.setMinutes(result.getMinutes() + amount);
		return result;
	}

	// Fallback ISO/date parsing
	const parsed = parseISO(normalized);
	return isValid(parsed) ? parsed : null;
};

// ---------------------------------------
// Helpers
// ---------------------------------------
const handleRelativeDay = (expression: string, base: Date) => {
	const match = expression.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|hrs?)?/i);
	if (match) {
		applyExplicitTime(match, base);
		return base;
	}

	if (expression.includes("morning")) base.setHours(9, 0, 0, 0);
	else if (expression.includes("afternoon")) base.setHours(14, 0, 0, 0);
	else if (expression.includes("evening")) base.setHours(18, 0, 0, 0);
	return base;
};

const applyExplicitTime = (match: RegExpMatchArray, date: Date) => {
	const hour = parseInt(match[1]);
	const minute = parseInt(match[2] || "0");
	const ampm = match[3]?.toLowerCase();

	let h = hour;
	if (ampm === "pm" && hour !== 12) h += 12;
	if (ampm === "am" && hour === 12) h = 0;

	date.setHours(h, minute, 0, 0);
};

const applyTimePart = (normalized: string, date: Date) => {
	const match = normalized.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|hrs?)?/i);
	if (match) applyExplicitTime(match, date);
	else date.setHours(9, 0, 0, 0);
};
