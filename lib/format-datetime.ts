export function formatDateTime(date: Date | string | null): string {
	if (typeof date === "string") {
		date = new Date(date);
	}
	if (!date) return "";

	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const dayName = days[date.getDay()];
	const monthName = months[date.getMonth()];
	const dayOfMonth = date.getDate();

	let hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12;
	hours = hours ? hours : 12;
	const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

	return `${dayName}, ${monthName} ${dayOfMonth}, ${hours}:${minutesStr} ${ampm}`;
}
