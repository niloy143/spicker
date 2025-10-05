import { useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { getDatesInMonth, dateString, formatHours, getDatesBetween } from "../../utils/dates";
import Spinner from "../../components/Spinner";
import useWorkedHours from "../../hooks/useWorkedHours";
import useOffDays from "../../hooks/useOffDays";
import { format, isSameDay } from "date-fns";
import Switch from "react-switch";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useWeeklyRequiredHours } from "../../hooks/useWeeklyRequiredHours";
import { WeeklyHoursInput } from "./WeeklyHoursInput";

export default function Stats() {
	const currentMonth = getDatesInMonth();
	const [startDate, setStartDate] = useState<Date>(currentMonth[0]);
	const [endDate, setEndDate] = useState<Date>(currentMonth[new Date().getDate() - 1]);
	const dates = useMemo(() => getDatesBetween(startDate, endDate), [startDate, endDate]);

	const { weeklyRequiredHours } = useWeeklyRequiredHours();

	const { offDays, addOffDay, removeOffDay } = useOffDays();
	const { workedHours, isLoading } = useWorkedHours(startDate, endDate);

	const isOffDay = (date: Date) => offDays.some((offDay) => isSameDay(offDay, date));

	const stats = dates.map((date) => {
		const dateStr = dateString(date);

		return {
			date,
			requiredHours: isOffDay(date) ? 0 : weeklyRequiredHours[date.getDay()],
			workedHours: (workedHours?.find((v) => v.date === dateStr)?.total || 0) / 3600,
		};
	});

	const totalWorkedHours = stats.reduce((sum, { workedHours }) => sum + workedHours, 0);
	const totalRequiredHours = stats.reduce((sum, { requiredHours }) => sum + requiredHours, 0);
	const totalGapHours = totalWorkedHours - totalRequiredHours;
	const isLessWorkedInTotal = totalGapHours < 0;

	return (
		<div className="bg-white rounded-lg shadow p-4 overflow-x-auto max-w-7xl mx-auto">
			<h3 className="text-2xl font-semibold mt-3 mb-6 text-center text-gray-600">Spicker Reports</h3>

			<div className="mb-4 flex justify-between items-end">
				<DatePicker
					value={[dates[0], dates[dates.length - 1]]}
					range
					inputClass="px-4 py-2 border border-gray-300 focus:border-2 focus:border-brand focus:outline-none rounded-md text-gray-700 font-medium bg-white shadow-sm"
					onChange={(dateRange) => {
						if (dateRange.length !== 2) return;
						if (dateRange.some((date) => !date.isValid)) return;

						const start = new Date(dateRange[0].format());
						const end = new Date(dateRange[1].format());

						setStartDate(start);
						setEndDate(end);
					}}
				/>
				<WeeklyHoursInput />
				<div className="flex items-stretch space-x-2 mt-2">
					<button
						className="p-3 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium transition"
						onClick={() => {
							const prevMonth = new Date(startDate);
							prevMonth.setMonth(prevMonth.getMonth() - 1);
							const prevMonthDates = getDatesInMonth(prevMonth);
							setStartDate(prevMonthDates[0]);
							setEndDate(prevMonthDates[prevMonthDates.length - 1]);
						}}
					>
						<FaChevronLeft />
					</button>
					<span className="flex-1 flex justify-center items-center px-5 bg-brand-light/50 text-brand font-semibold rounded">
						{format(startDate, "MMMM, yyyy")}
					</span>
					<button
						className="p-3 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium transition"
						onClick={() => {
							const nextMonth = new Date(startDate);
							nextMonth.setMonth(nextMonth.getMonth() + 1);
							const nextMonthDates = getDatesInMonth(nextMonth);
							setStartDate(nextMonthDates[0]);
							setEndDate(nextMonthDates[nextMonthDates.length - 1]);
						}}
					>
						<FaChevronRight />
					</button>
				</div>
			</div>

			<table className="min-w-full border border-gray-300 rounded overflow-hidden">
				<thead>
					<tr className="bg-gray-100">
						<th className="px-3 py-2 text-left font-semibold text-gray-700 max-w-[100px]"> Date </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Day </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Required </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Worked </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Difference </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Off Day </th>
					</tr>
				</thead>
				<tbody>
					{stats.map(({ date, requiredHours, workedHours }) => {
						const gapHours = workedHours - requiredHours;
						const isLessWorked = gapHours < 0;
						const dayStr = date.toLocaleDateString("en-US", { weekday: "long" });
						const dateStr = `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "long" })} ${date.getFullYear()}`;
						const offDay = isOffDay(date);

						return (
							<tr key={date.toString()} className={`even:bg-gray-50`}>
								<td className={`px-3 py-2 whitespace-nowrap`}>{dateStr}</td>
								<td className={`px-3 py-2 whitespace-nowrap`}>{dayStr}</td>
								<td className={`px-3 py-2 whitespace-nowrap`}>{formatHours(requiredHours)}</td>
								<td className={`px-3 py-2 whitespace-nowrap`}>{isLoading ? <Spinner /> : formatHours(workedHours)}</td>
								<td className={`px-3 py-2 whitespace-nowrap ${isLessWorked ? "text-red-800" : "text-green-800"}`}>
									{isLoading ? <Spinner /> : formatHours(gapHours)}
								</td>
								<td className={`px-3 py-2 whitespace-nowrap flex items-center`}>
									<Switch
										checked={offDay}
										onChange={() => {
											if (offDay) removeOffDay(date);
											else addOffDay(date);
										}}
										height={20}
										width={40}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr className="bg-gray-200 font-semibold">
						<th className="px-3 py-2 text-left"> Total </th>
						<th />
						<th className="px-3 py-2 text-left"> {formatHours(totalRequiredHours)} </th>
						<th className="px-3 py-2 text-left"> {isLoading ? <Spinner /> : formatHours(totalWorkedHours)} </th>
						<th className={`px-3 py-2 text-left ${isLessWorkedInTotal ? "text-red-800" : "text-green-800"}`}>
							{isLoading ? <Spinner /> : formatHours(totalGapHours)}
						</th>
						<th />
					</tr>
				</tfoot>
			</table>
		</div>
	);
}
