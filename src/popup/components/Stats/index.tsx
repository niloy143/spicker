import { useEffect, useState } from "react";
import { getDatesInMonth, formatDate, dateString, formatHours } from "../../../utils/dates";
import { getWorkedHours, WorkedHour } from "../../../utils/api";
import Spinner from "../Spinner";

export default function Stats() {
	const [workedHours, setWorkedHours] = useState<WorkedHour[]>();
	const [loading, setLoading] = useState(true);

	const weeklyRequiredHours = [0, 8, 8, 8, 8, 8, 4];
	const dates = getDatesInMonth();

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
			.finally(() => setLoading(false));
	}, []);

	if (loading)
		return (
			<div className="min-h-screen flex justify-center items-center">
				<Spinner />
			</div>
		);

	return (
		<div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
			<h3 className="text-lg font-bold mb-4 text-center">Spicker Reports</h3>
			<table className="min-w-full border border-gray-300 rounded overflow-hidden">
				<thead>
					<tr className="bg-gray-100">
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Date </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Worked </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Required </th>
						<th className="px-3 py-2 text-left font-semibold text-gray-700"> Difference </th>
					</tr>
				</thead>
				<tbody>
					{stats.map(({ date, requiredHours, workedHours }) => {
						const gapHours = workedHours - requiredHours;
						const isLessWorked = gapHours < 0;

						return (
							<tr key={date.toString()} className="even:bg-gray-50">
								<td className="px-3 py-2 whitespace-nowrap"> {formatDate(date)} </td>
								<td className="px-3 py-2 whitespace-nowrap"> {formatHours(workedHours)} </td>
								<td className="px-3 py-2 whitespace-nowrap"> {formatHours(requiredHours)} </td>
								<td className="px-3 py-2 whitespace-nowrap">
									{isLessWorked ? "(-)" : ""} {formatHours(gapHours)}
								</td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr className="bg-gray-200 font-semibold">
						<th className="px-3 py-2 text-left"> Total </th>
						<th className="px-3 py-2 text-left"> {formatHours(totalWorkedHours)} </th>
						<th className="px-3 py-2 text-left"> {formatHours(totalRequiredHours)} </th>
						<th className="px-3 py-2 text-left">
							{isLessWorkedInTotal ? "(-)" : ""} {formatHours(totalGapHours)}
						</th>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}
