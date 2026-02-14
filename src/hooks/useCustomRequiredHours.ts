import { useEffect, useState } from "react";

const KEY = "custom-required-hours";

export type CustomRequiredHours = {
	[dateString: string]: number; // dateString in format YYYY-MM-DD => hours
};

export default function useCustomRequiredHours() {
	const [customHours, setCustomHours] = useState<CustomRequiredHours>({});
	const [isLoading, setIsLoading] = useState(true);

	const save = (hours: CustomRequiredHours) => {
		if (typeof chrome !== "undefined" && chrome.storage) {
			chrome.storage.sync.set({ [KEY]: hours });
		} else {
			localStorage.setItem(KEY, JSON.stringify(hours));
		}
	};

	const setCustomHour = (dateString: string, hours: number) => {
		setCustomHours((prev) => {
			const updated = { ...prev, [dateString]: hours };
			save(updated);
			return updated;
		});
	};

	const removeCustomHour = (dateString: string) => {
		setCustomHours((prev) => {
			const updated = { ...prev };
			delete updated[dateString];
			save(updated);
			return updated;
		});
	};

	const getCustomHour = (dateString: string): number | undefined => {
		return customHours[dateString];
	};

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			try {
				let loadedHours: CustomRequiredHours = {};

				if (typeof chrome !== "undefined" && chrome.storage) {
					const result = await chrome.storage.sync.get([KEY]);
					if (result[KEY]) {
						loadedHours = result[KEY];
					} else {
						// Migration from localStorage
						const local = localStorage.getItem(KEY);
						if (local) {
							loadedHours = JSON.parse(local);
							chrome.storage.sync.set({ [KEY]: loadedHours });
						}
					}
				} else {
					const local = localStorage.getItem(KEY);
					if (local) {
						loadedHours = JSON.parse(local);
					}
				}

				if (typeof loadedHours === "object") {
					setCustomHours(loadedHours);
				}
			} catch (error) {
				console.error("Error loading custom required hours:", error);
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, []);

	return { customHours, isLoading, setCustomHour, removeCustomHour, getCustomHour };
}
