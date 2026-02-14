import { useEffect, useState } from "react";
import { isDate } from "../utils/is-date";

const KEY = "off-days";

export default function useOffDays() {
	const [offDays, setOffDays] = useState<Date[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const save = (days: Date[]) => {
		const strings = days.map((d) => d.toISOString());
		if (typeof chrome !== "undefined" && chrome.storage) {
			chrome.storage.sync.set({ [KEY]: strings });
		} else {
			localStorage.setItem(KEY, JSON.stringify(strings));
		}
	};

	const addOffDay = (date: Date) => {
		setOffDays((prev) => {
			const newOffDays = [...prev, date];
			save(newOffDays);
			return newOffDays;
		});
	};

	const removeOffDay = (date: Date) => {
		setOffDays((prev) => {
			const newOffDays = prev.filter((d) => d.getTime() !== date.getTime());
			save(newOffDays);
			return newOffDays;
		});
	};

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			try {
				let loadedDays: string[] = [];

				if (typeof chrome !== "undefined" && chrome.storage) {
					const result = await chrome.storage.sync.get([KEY]);
					if (result[KEY]) {
						loadedDays = result[KEY];
					} else {
						// Migration
						const local = localStorage.getItem(KEY);
						if (local) {
							loadedDays = JSON.parse(local);
							chrome.storage.sync.set({ [KEY]: loadedDays });
						}
					}
				} else {
					const local = localStorage.getItem(KEY);
					if (local) {
						loadedDays = JSON.parse(local);
					}
				}

				if (Array.isArray(loadedDays)) {
					const dates = loadedDays
						.map((d) => new Date(d))
						.filter((d) => isDate(d));
					setOffDays(dates);
				}
			} catch (error) {
				console.error("Error loading off days:", error);
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, []);

	return { offDays, isLoading, addOffDay, removeOffDay };
}
