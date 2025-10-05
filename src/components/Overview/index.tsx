import React from "react";

import { useMemo } from "react";
import { getDatesInMonth, dateString, formatHours } from "../../utils/dates.js";
import useWorkedHours from "../../hooks/useWorkedHours.js";
import useOffDays from "../../hooks/useOffDays.js";
import { isSameDay, format } from "date-fns";
import Spinner from "../Spinner/index.js";
import { useWeeklyRequiredHours } from "../../hooks/useWeeklyRequiredHours.js";

interface StatCardProps {
	title: string;
	subtitle: string;
	hoursWorked: number | null;
	hoursRemaining: number | null;
	isLoading: boolean;
	progress: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, subtitle, hoursWorked, hoursRemaining, isLoading, progress }) => {
	const isOverworked = hoursRemaining !== null && hoursRemaining <= 0;

	return (
		<div className="bg-white/95 backdrop-blur-[10px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-5 border border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
			<div className="flex items-center justify-center">
				<span className="text-base font-bold text-gray-800 mb-2">
					{title} <span className="opacity-70">- {subtitle}</span>
				</span>
				{isLoading && (
					<span className="absolute right-4 top-4">
						<Spinner size="small" />
					</span>
				)}
			</div>
			<div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
				<span className="text-gray-500 text-sm font-medium">Worked</span>
				<span className="font-bold text-base text-[#1379cc] flex items-center gap-1 min-h-5">{formatHours(hoursWorked || 0)}</span>
			</div>
			<div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
				<span className="text-gray-500 text-sm font-medium">{isOverworked ? "Overworked" : "Remaining"}</span>
				<span
					className={`font-bold text-base ${
						isLoading ? "text-gray-500" : isOverworked ? "text-green-800" : "text-red-800"
					} flex items-center gap-1 min-h-5`}
				>
					{isLoading ? "" : isOverworked ? "(+)" : "(–)"} {formatHours(hoursRemaining || 0)}
				</span>
			</div>
			<div className="w-full h-1.5 bg-black/10 rounded mt-3 overflow-hidden">
				<div
					className="h-full bg-gradient-to-r from-[#419ce7] to-[#1379cc] rounded transition-all duration-300"
					style={{ width: `${Math.min(progress, 100)}%` }}
				></div>
			</div>
		</div>
	);
};

const Overview = () => {
	const today = new Date();
	const todaySubtitle = format(today, "MMM d, yyyy");
	const monthSubtitle = format(today, "MMMM");
	const currentMonth = getDatesInMonth();
	const startOfMonth = currentMonth[0];
	const endOfMonth = currentMonth[currentMonth.length - 1];

	const { workedHours, isFetching } = useWorkedHours(startOfMonth, endOfMonth);
	const { offDays } = useOffDays();

	const weeklyRequiredHours = useWeeklyRequiredHours();

	const isOffDay = (date: Date) => offDays.some((offDay) => isSameDay(offDay, date));

	const dailyRequired = weeklyRequiredHours[today.getDay()];
	const dailyWorked = useMemo(() => {
		if (!workedHours) return null;
		const todayStr = dateString(today);
		const todayEntry = workedHours.find((v) => v.date === todayStr);
		return todayEntry ? todayEntry.total / 3600 : 0;
	}, [workedHours, today]);

	const dailyRemaining = dailyWorked !== null ? dailyRequired - dailyWorked : null;

	const monthlyRequired = useMemo(() => {
		if (!currentMonth) return 0;
		const dates = currentMonth.slice(0, today.getDate());
		return dates.reduce((sum, date) => sum + (isOffDay(date) ? 0 : weeklyRequiredHours[date.getDay()]), 0);
	}, [currentMonth, today, offDays]);

	const monthlyWorked = useMemo(() => {
		if (!workedHours || !startOfMonth) return null;
		const monthWorked =
			workedHours
				.filter((entry) => {
					const entryDate = new Date(entry.date);
					return entryDate >= startOfMonth && entryDate <= today;
				})
				.reduce((sum, entry) => sum + entry.total, 0) / 3600;
		return monthWorked;
	}, [workedHours, startOfMonth, today]);

	const monthlyRemaining = monthlyWorked !== null ? monthlyRequired - monthlyWorked : null;

	const dailyProgress = dailyWorked && dailyRemaining !== null ? (dailyWorked / (dailyWorked + dailyRemaining)) * 100 : 0;
	const monthlyProgress = monthlyWorked && monthlyRemaining !== null ? (monthlyWorked / (monthlyWorked + monthlyRemaining)) * 100 : 0;

	return (
		<div className="text-gray-800 font-sans m-0 p-0 box-border">
			<div className="grid gap-4">
				<StatCard
					title={"Today"}
					subtitle={todaySubtitle}
					hoursWorked={dailyWorked}
					hoursRemaining={dailyRemaining}
					isLoading={isFetching}
					progress={dailyProgress}
				/>
				<StatCard
					title={"This Month"}
					subtitle={monthSubtitle}
					hoursWorked={monthlyWorked}
					hoursRemaining={monthlyRemaining}
					isLoading={isFetching}
					progress={monthlyProgress}
				/>
			</div>
		</div>
	);
};

export default Overview;
