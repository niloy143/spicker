import { useEffect, useState } from "react";
import { isDate } from "../../utils/is-date";

const KEY = "off-days";

const getStoredOffDays = () => {
	const storedOffDays = localStorage.getItem(KEY);
	if (storedOffDays) {
		try {
			const parsedOffDays = JSON.parse(storedOffDays) as string[];
			return parsedOffDays.map((day) => {
				const date = new Date(day);
				if (!isDate(date)) throw new Error(`Invalid date: ${day}`);
				return date;
			});
		} catch (error) {
			console.error("Error parsing off days from localStorage:", error);
		}
	}
	return [];
};

const storeOffDays = (days: Date[]) => {
	localStorage.setItem(KEY, JSON.stringify(days));
};

export default function useOffDays() {
	const [offDays, setOffDays] = useState<Date[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const addOffDay = (date: Date) => {
		setOffDays((prev) => {
			const newOffDays = [...prev, date];
			storeOffDays(newOffDays);
			return newOffDays;
		});
	};

	const removeOffDay = (date: Date) => {
		setOffDays((prev) => {
			const newOffDays = prev.filter((d) => d.getTime() !== date.getTime());
			storeOffDays(newOffDays);
			return newOffDays;
		});
	};

	useEffect(() => {
		const storedOffDays = getStoredOffDays();
		if (storedOffDays.length) setOffDays(storedOffDays);
		setIsLoading(false);
	}, []);

	return { offDays, isLoading, addOffDay, removeOffDay };
}
