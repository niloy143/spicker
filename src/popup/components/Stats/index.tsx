import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { getDatesInMonth, formatDate, dateString, formatHours, getDatesBetween } from "../../../utils/dates";
import { getWorkedHours, WorkedHour } from "../../../utils/api";
import Spinner from "../Spinner";

export default function Stats() {
	const currentMonth = getDatesInMonth();
	const [startDate, setStartDate] = useState<Date>(currentMonth[0]);
	const [endDate, setEndDate] = useState<Date>(currentMonth[currentMonth.length - 1]);
	const [workedHours, setWorkedHours] = useState<WorkedHour[]>();
	const [loading, setLoading] = useState(true);
	const dates = useMemo(() => getDatesBetween(startDate, endDate), [startDate, endDate]);

	const weeklyRequiredHours = [0, 8, 8, 8, 8, 8, 4];

	const stats = dates.map((date) => {
		const dateStr = dateString(date);

		return {
			date: date,
			requiredHours: weeklyRequiredHours[date.getDay()],
			workedHours: (workedHours?.find((v) => v.date === dateStr)?.total || 0) / 3600,
		};
	});

	const totalWorkedHours = stats.reduce((sum, { workedHours }) => sum + workedHours, 0);
	const totalRequiredHours = stats.reduce((sum, { requiredHours }) => sum + requiredHours, 0);
	const totalGapHours = totalWorkedHours - totalRequiredHours;
	const isLessWorkedInTotal = totalGapHours < 0;

	useEffect(() => {
		setLoading(true);

		getWorkedHours(dates[0], dates[dates.length - 1])
			.then((ts) => setWorkedHours(ts))
			.catch(() => (window.location.href = "https://tracker.toptal.com/app/reports"))
			.finally(() => setLoading(false));
	}, [dates]);

	return (
		<div className="bg-white rounded-lg shadow p-4 overflow-x-auto max-w-7xl mx-auto">
			<h3 className="text-3xl font-semibold mt-3 mb-6 text-center">Spicker Reports</h3>

			<div className="mb-4">
				<DatePicker
					value={[dates[0], dates[dates.length - 1]]}
					range
					onChange={(dateRange) => {
						if (dateRange.length !== 2) return;
						if (dateRange.some((date) => !date.isValid)) return;

						const start = new Date(dateRange[0].format());
						const end = new Date(dateRange[1].format());

						setStartDate(start);
						setEndDate(end);
					}}
				/>
			</div>

			<table className="min-w-full border border-gray-300 rounded overflow-hidden">
				<thead>
					<tr className="bg-gray-100">
						<th className="px-3 py-2 text-left font-semibold text-gray-700 max-w-[100px]"> Date </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Day </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Required </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Worked </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Difference </th>
					</tr>
				</thead>
				<tbody>
					{stats.map(({ date, requiredHours, workedHours }) => {
						const gapHours = workedHours - requiredHours;
						const isLessWorked = gapHours < 0;
						const dayStr = date.toLocaleDateString("en-US", { weekday: "long" });
						const dateStr = `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "long" })} ${date.getFullYear()}`;

						return (
							<tr key={date.toString()} className="even:bg-gray-50">
								<td className={`px-3 py-2 whitespace-nowrap`}>{dateStr}</td>
								<td className={`px-3 py-2 whitespace-nowrap`}>{dayStr}</td>
								<td className={`px-3 py-2 whitespace-nowrap`}>{formatHours(requiredHours)}</td>
								<td className={`px-3 py-2 whitespace-nowrap`}>{loading ? <Spinner /> : formatHours(workedHours)}</td>
								<td className={`px-3 py-2 whitespace-nowrap ${isLessWorked ? "text-red-800" : "text-green-800"}`}>
									{loading ? <Spinner /> : formatHours(gapHours)}
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
						<th className="px-3 py-2 text-left"> {loading ? <Spinner /> : formatHours(totalWorkedHours)} </th>
						<th className={`px-3 py-2 text-left ${isLessWorkedInTotal ? "text-red-800" : "text-green-800"}`}>
							{loading ? <Spinner /> : formatHours(totalGapHours)}
						</th>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}
