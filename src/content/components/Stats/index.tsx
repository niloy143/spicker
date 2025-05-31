import { useEffect, useState } from "react";
import { getDatesInMonth, formatDate, dateString, formatHours } from "../../../utils/dates";
import { getWorkedHours, WorkedHour } from "../../../utils/api";

const styles: { [key: string]: React.CSSProperties } = {
	container: {
		padding: "20px 30px",
	},
	h3: {
		padding: "10px 10px 24px 10px",
		fontSize: 32,
		fontWeight: 600,
		textAlign: "center",
	},
	tr: {
		border: "1px solid #999",
	},
	td: {
		border: "1px solid #999",
		padding: "10px 20px",
	},
	th: {
		border: "1px solid #333",
		padding: "10px 20px",
		fontWeight: 600,
	},
};

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

	return (
		<div style={styles.container}>
			<h3 style={styles.h3}>Spicker Reports</h3>
			<table>
				<thead>
					<tr style={styles.tr}>
						<th style={styles.th}> Date </th>
						<th style={styles.th}> Worked </th>
						<th style={styles.th}> Required </th>
						<th style={styles.th}> Difference </th>
					</tr>
				</thead>
				<tbody>
					{stats.map(({ date, requiredHours, workedHours }) => {
						const gapHours = workedHours - requiredHours;
						const isLessWorked = gapHours < 0;

						return (
							<tr key={date.toString()} style={styles.tr}>
								<td style={styles.td}> {formatDate(date)} </td>
								<td style={styles.td}> {formatHours(workedHours)} </td>
								<td style={styles.td}> {formatHours(requiredHours)} </td>
								<td style={styles.td}>
									{isLessWorked ? "(-)" : ""} {formatHours(gapHours)}
								</td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr style={styles.tr}>
						<th style={styles.th}> Total </th>
						<th style={styles.th}> {formatHours(totalWorkedHours)} </th>
						<th style={styles.th}> {formatHours(totalRequiredHours)} </th>
						<th style={styles.th}>
							{isLessWorkedInTotal ? "(-)" : ""} {formatHours(totalGapHours)}
						</th>
					</tr>
				</tfoot>
			</table>
		</div>
	);
}
