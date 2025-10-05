import { useEffect, useState } from "react";

const DEFAULT_WEEKLY_REQUIRED_HOURS = [0, 8, 8, 8, 8, 8, 4];

export function useWeeklyRequiredHours() {
	const [weeklyRequiredHours, setWeeklyRequiredHours] = useState(DEFAULT_WEEKLY_REQUIRED_HOURS);

	useEffect(() => {
		const stored = localStorage.getItem("weeklyRequiredHours");

		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length === 7 && parsed.every((num) => typeof num === "number")) {
					setWeeklyRequiredHours(parsed);
				}
			} catch {}
		}
	}, []);

	return weeklyRequiredHours;
}
