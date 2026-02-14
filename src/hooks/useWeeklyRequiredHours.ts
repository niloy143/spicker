import React, { createContext, useContext, useEffect, useState } from "react";

const DEFAULT_WEEKLY_REQUIRED_HOURS = [0, 8, 8, 8, 8, 8, 4];
const KEY = "weekly_required_hours";

const WeeklyRequiredHoursContext = createContext<{
	weeklyRequiredHours: number[];
	updateWeeklyRequiredHours: (newHours: number[]) => void;
} | null>(null);

export const WeeklyRequiredHoursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [weeklyRequiredHours, setWeeklyRequiredHours] = useState(DEFAULT_WEEKLY_REQUIRED_HOURS);

	useEffect(() => {
		const load = async () => {
			try {
				let loadedHours: number[] | null = null;

				if (typeof chrome !== "undefined" && chrome.storage) {
					const result = await chrome.storage.sync.get([KEY]);
					if (result[KEY]) {
						loadedHours = result[KEY];
					} else {
						// Migration from localStorage
						const local = localStorage.getItem(KEY);
						if (local) {
							const parsed = JSON.parse(local);
							if (Array.isArray(parsed) && parsed.length === 7 && parsed.every((num) => typeof num === "number")) {
								loadedHours = parsed;
								chrome.storage.sync.set({ [KEY]: parsed });
							}
						}
					}
				} else {
					const local = localStorage.getItem(KEY);
					if (local) {
						const parsed = JSON.parse(local);
						if (Array.isArray(parsed) && parsed.length === 7 && parsed.every((num) => typeof num === "number")) {
							loadedHours = parsed;
						}
					}
				}

				if (loadedHours) {
					setWeeklyRequiredHours(loadedHours);
				}
			} catch (error) {
				console.error("Error loading weekly required hours:", error);
			}
		};
		load();
	}, []);

	const updateWeeklyRequiredHours = (newHours: number[]) => {
		if (Array.isArray(newHours) && newHours.length === 7 && newHours.every((num) => typeof num === "number")) {
			setWeeklyRequiredHours(newHours);
			if (typeof chrome !== "undefined" && chrome.storage) {
				chrome.storage.sync.set({ [KEY]: newHours });
			} else {
				localStorage.setItem(KEY, JSON.stringify(newHours));
			}
		}
	};

	return React.createElement(
		WeeklyRequiredHoursContext.Provider,
		{ value: { weeklyRequiredHours, updateWeeklyRequiredHours } },
		children
	);
};

export function useWeeklyRequiredHours() {
	const context = useContext(WeeklyRequiredHoursContext);
	if (!context) {
		throw new Error('useWeeklyRequiredHours must be used within a WeeklyRequiredHoursProvider');
	}
	return context;
}
