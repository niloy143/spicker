/**
 * Returns an array of Date objects for all days in the month of the given date
 * @param date - The reference date
 * @returns Array of Date objects representing each day of the month
 */
export function getDatesInMonth(date: Date = new Date()): Date[] {
	const year = date.getFullYear();
	const month = date.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	return Array.from({ length: daysInMonth }, (_, i) => {
		return new Date(year, month, i + 1);
	});
}

/**
 * Compares two dates to check if they fall on the same day
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns boolean indicating if both dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}

/**
 * Formats a date into "Weekday, DD Month YYYY" format
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	const weekDay = days[date.getDay()];
	const day = date.getDate();
	const month = months[date.getMonth()];
	const year = date.getFullYear();

	return `${weekDay}, ${day} ${month} ${year}`;
}

/**
 * Formats a number of hours as a human-readable string.
 * Handles singular/plural forms and omits zero values for hours or minutes.
 * Examples:
 *   formatHours(1.5) => "1 hour 30 minutes"
 *   formatHours(2)   => "2 hours"
 *   formatHours(0.25) => "15 minutes"
 *   formatHours(0)   => "0 minutes"
 * @param hours - The number of hours (can be fractional)
 * @returns A formatted string representing the hours and minutes
 */
export function formatHours(hours: number): string {
	hours = Math.abs(hours);

	const totalMinutes = Math.round(hours * 60);
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	const parts: string[] = [];

	if (h > 0) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
	if (m > 0 || h === 0) parts.push(`${m} minute${m !== 1 ? "s" : ""}`);

	return parts.join(" ");
}

/**
 * Converts a Date object to a string in "YYYY-MM-DD" format.
 * Optionally, you can specify a custom separator (default is "-").
 * @param date - The Date object to format
 * @param separator - The separator to use between year, month, and day (default: "-")
 * @returns The formatted date string in "YYYY-MM-DD" format
 */
export function dateString(date: Date, separator: string = "-"): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return [year, month, day].join(separator);
}
