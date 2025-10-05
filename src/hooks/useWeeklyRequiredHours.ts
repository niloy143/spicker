import React, { createContext, useContext, useEffect, useState } from "react";

const DEFAULT_WEEKLY_REQUIRED_HOURS = [0, 8, 8, 8, 8, 8, 4];

const WeeklyRequiredHoursContext = createContext<{
	weeklyRequiredHours: number[];
	updateWeeklyRequiredHours: (newHours: number[]) => void;
} | null>(null);

export const WeeklyRequiredHoursProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [weeklyRequiredHours, setWeeklyRequiredHours] = useState(DEFAULT_WEEKLY_REQUIRED_HOURS);

	useEffect(() => {
		const stored = localStorage.getItem("weekly_required_hours");

		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length === 7 && parsed.every((num) => typeof num === "number")) {
					setWeeklyRequiredHours(parsed);
				}
			} catch {}
		}
	}, []);

	const updateWeeklyRequiredHours = (newHours: number[]) => {
		if (Array.isArray(newHours) && newHours.length === 7 && newHours.every((num) => typeof num === "number")) {
			setWeeklyRequiredHours(newHours);
			localStorage.setItem("weekly_required_hours", JSON.stringify(newHours));
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
