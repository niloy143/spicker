import { useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { getDatesInMonth, dateString, formatHours, getDatesBetween } from "../../utils/dates";
import Spinner from "../../components/Spinner";
import useWorkedHours from "../../hooks/useWorkedHours";
import useOffDays from "../../hooks/useOffDays";
import useCustomRequiredHours from "../../hooks/useCustomRequiredHours";
import { format, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import Switch from "react-switch";
import { FaChevronLeft, FaChevronRight, FaEdit, FaCheck, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { useWeeklyRequiredHours } from "../../hooks/useWeeklyRequiredHours";
import { WeeklyHoursInput } from "./WeeklyHoursInput";
import { TRACKER_WEB_URL } from "../../utils/api";

function formatHoursShort(hours: number): string {
	const h = Math.floor(Math.abs(hours));
	const m = Math.round((Math.abs(hours) - h) * 60);
	if (h === 0 && m === 0) return "0h";
	return `${h}h${m > 0 ? ` ${m}m` : ""}`;
}


const CircularProgressCard = ({ title, filled, required, subtext, isLoading }: { title: string; filled: number; required: number; subtext: string; isLoading: boolean }) => {
	const rawPercent = required > 0 ? (filled / required) * 100 : 0;
	const percent = Math.min(100, rawPercent);
	
	const mainColor = "#10446F"; 
	const secondaryColor = "#A7DEFD";

	// SVG Circle config
	const size = 80;
	const strokeWidth = 8;
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (percent / 100) * circumference;

	return (
		<div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: secondaryColor+'7a', borderColor: mainColor+'21' }}>
			<div className="flex flex-col justify-between h-full">
				<div className="text-sm font-medium mb-1" style={{ color: mainColor }}>{title}</div>
				<div className="flex items-end gap-2 mb-1">
					<span className="text-2xl font-bold" style={{ color: mainColor }}>{isLoading ? <span className="animate-pulse">...</span> : formatHoursShort(filled)}</span>
					<span className="text-sm mb-1 opacity-80" style={{ color: mainColor }}>/ {formatHoursShort(required)}</span>
				</div>
				<div className="text-xs mt-auto" style={{ color: mainColor }}>{subtext}</div>
			</div>
			
			<div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
				<svg className="transform -rotate-90 w-full h-full">
					<circle
						className="opacity-30"
						strokeWidth={strokeWidth}
						stroke={mainColor} 
						fill="transparent"
						r={radius}
						cx={size / 2}
						cy={size / 2}
					/>
					<circle
						className="transition-all duration-1000 ease-out"
						strokeWidth={strokeWidth}
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						stroke={mainColor}
						fill="transparent"
						r={radius}
						cx={size / 2}
						cy={size / 2}
					/>
				</svg>
				<div className="absolute text-sm font-bold" style={{ color: mainColor }}>
					{Math.round(rawPercent)}%
				</div>
			</div>
		</div>
	);
};



export default function Stats() {
	const currentMonth = getDatesInMonth();
	const [startDate, setStartDate] = useState<Date>(currentMonth[0]);
	const [endDate, setEndDate] = useState<Date>(currentMonth[new Date().getDate() - 1]);
	const dates = useMemo(() => getDatesBetween(startDate, endDate), [startDate, endDate]);

	const { weeklyRequiredHours } = useWeeklyRequiredHours();
	const { offDays, addOffDay, removeOffDay } = useOffDays();
	const { workedHours, isLoading } = useWorkedHours(startDate, endDate);
	const { customHours, setCustomHour, removeCustomHour, getCustomHour } = useCustomRequiredHours();

	const [editingRequired, setEditingRequired] = useState<string | null>(null);
	const [tempValue, setTempValue] = useState("");
	const [hoveredRow, setHoveredRow] = useState<string | null>(null);

	const isOffDay = (date: Date) => offDays.some((offDay) => isSameDay(offDay, date));

	const getRequiredHours = (date: Date, dateStr: string) => {
		if (isOffDay(date)) return 0;
		const custom = getCustomHour(dateStr);
		return custom !== undefined ? custom : weeklyRequiredHours[date.getDay()];
	};

	const stats = dates.map((date) => {
		const dateStr = dateString(date);
		const rawWorkedHours = (workedHours?.find((v) => v.date === dateStr)?.total || 0) / 3600;

		return {
			date,
			dateStr,
			requiredHours: getRequiredHours(date, dateStr),
			workedHours: rawWorkedHours,
		};
	});

	const totalWorkedHours = stats.reduce((sum, { workedHours }) => sum + workedHours, 0);
	const totalRequiredHours = stats.reduce((sum, { requiredHours }) => sum + requiredHours, 0);
	const totalGapHours = totalWorkedHours - totalRequiredHours;
	const isLessWorkedInTotal = totalGapHours < 0;

	const handleRequiredEdit = (dateStr: string, currentValue: number) => {
		setEditingRequired(dateStr);
		setTempValue(currentValue.toString());
	};

	const handleRequiredSave = (dateStr: string, date: Date) => {
		const value = parseFloat(tempValue);
		if (!isNaN(value) && value >= 0) {
			const defaultValue = weeklyRequiredHours[date.getDay()];
			if (value === defaultValue) {
				removeCustomHour(dateStr);
			} else {
				setCustomHour(dateStr, value);
			}
		}
		setEditingRequired(null);
		setTempValue("");
	};

	const handleRequiredCancel = () => {
		setEditingRequired(null);
		setTempValue("");
	};



	const currentWeekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []);
	const currentWeekEnd = useMemo(() => endOfWeek(new Date(), { weekStartsOn: 0 }), []);
	const { workedHours: currentWeekWorkedData, isLoading: isLoadingCurrentWeek } = useWorkedHours(currentWeekStart, currentWeekEnd);

	const currentWeekFilled = useMemo(() => (currentWeekWorkedData || []).reduce((acc, curr) => acc + curr.total, 0) / 3600, [currentWeekWorkedData]);

	const currentWeekRequired = useMemo(() => {
		const dates = getDatesBetween(currentWeekStart, currentWeekEnd);
		return dates.reduce((sum, date) => {
			const dStr = dateString(date);
			if (offDays.some((od) => isSameDay(od, date))) return sum;
			const custom = getCustomHour(dStr);
			return sum + (custom !== undefined ? custom : weeklyRequiredHours[date.getDay()]);
		}, 0);
	}, [currentWeekStart, currentWeekEnd, offDays, getCustomHour, weeklyRequiredHours]);

	const today = useMemo(() => new Date(), []);
	const todayStr = useMemo(() => dateString(today), [today]);
	const todayFilled = useMemo(() => {
		const found = (currentWeekWorkedData || []).find((v) => v.date === todayStr);
		return (found?.total || 0) / 3600;
	}, [currentWeekWorkedData, todayStr]);
	
	const todayRequired = useMemo(() => getRequiredHours(today, todayStr), [today, todayStr, getRequiredHours]);


	return (
		<div className="bg-white rounded-lg shadow p-4 max-w-7xl mx-auto">
			<h3 className="text-2xl font-semibold mt-3 mb-6 text-center text-gray-600 flex items-center justify-center gap-3">
				Spicker Reports
				<a
					href={TRACKER_WEB_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="text-gray-400 hover:text-brand transition-colors text-lg"
					title="Open TopTracker"
				>
					<FaExternalLinkAlt size={16} />
				</a>
			</h3>

			{/* Quick Summary Section */}
			<div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<CircularProgressCard
					title="Today's Progress"
					filled={todayFilled}
					required={todayRequired}
					subtext={format(today, "EEEE, MMMM do")}
					isLoading={isLoadingCurrentWeek}
				/>
				<CircularProgressCard
					title="Current Week"
					filled={currentWeekFilled}
					required={currentWeekRequired}
					subtext="Sun - Sat"
					isLoading={isLoadingCurrentWeek}
				/>
				<CircularProgressCard
					title="Period Progress"
					filled={totalWorkedHours}
					required={totalRequiredHours}
					subtext="Selected Range"
					isLoading={isLoading}
				/>
			</div>

			<div className="mb-6 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6">
				<div className="w-full lg:w-auto flex justify-center">
					<DatePicker
						value={[dates[0], dates[dates.length - 1]]}
						range
						inputClass="px-4 py-2 border border-gray-300 focus:border-2 focus:border-brand focus:outline-none rounded-md text-gray-700 font-medium bg-white shadow-sm w-64 text-center"
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
				<div className="w-full lg:w-auto flex justify-center overflow-x-auto pb-2 lg:pb-0">
					<WeeklyHoursInput />
				</div>
				<div className="flex items-stretch space-x-2 w-full lg:w-auto justify-center">
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
					<span className="flex-1 flex justify-center items-center px-5 bg-brand-light/50 text-brand font-semibold rounded min-w-[160px]">
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

			<div className="overflow-x-auto w-full border border-gray-300 rounded-lg">
				<table className="min-w-full divide-y divide-gray-200">
					<thead>
						<tr className="bg-gray-50">
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]"> Date </th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]"> Day </th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]"> Required </th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]"> Worked </th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]"> Difference </th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]"> Off Day </th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{stats.map(({ date, dateStr, requiredHours, workedHours }) => {
							const gapHours = workedHours - requiredHours;
							const isLessWorked = gapHours < 0;
							const dayStr = date.toLocaleDateString("en-US", { weekday: "long" });
							const dateDisplay = format(date, "dd MMMM, yyyy"); 
							const offDay = isOffDay(date);
							const isEditingReq = editingRequired === dateStr;
							const isHovered = hoveredRow === dateStr;

							return (
								<tr 
									key={date.toString()} 
									className={`hover:bg-blue-50 transition-colors ${offDay ? "bg-gray-50" : ""}`}
									onMouseEnter={() => setHoveredRow(dateStr)}
									onMouseLeave={() => setHoveredRow(null)}
								>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{dateDisplay}</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{dayStr}</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
										{isEditingReq ? (
											<div className="flex items-center gap-1">
												<input
													type="number"
													step="0.5"
													min="0"
													value={tempValue}
													onChange={(e) => setTempValue(e.target.value)}
													className="w-16 px-1 py-0.5 border border-brand rounded text-sm"
													autoFocus
													onKeyDown={(e) => {
														if (e.key === "Enter") handleRequiredSave(dateStr, date);
														if (e.key === "Escape") handleRequiredCancel();
													}}
												/>
												<button
													onClick={() => handleRequiredSave(dateStr, date)}
													className="text-green-600 hover:text-green-800"
													title="Save"
												>
													<FaCheck size={12} />
												</button>
												<button
													onClick={handleRequiredCancel}
													className="text-red-800 hover:text-red-800"
													title="Cancel"
												>
													<FaTimes size={12} />
												</button>
											</div>
										) : (
											<div className="flex items-center gap-2">
												<span>{formatHours(requiredHours)}</span>
												<button
													onClick={() => handleRequiredEdit(dateStr, requiredHours)}
													className="text-gray-400 hover:text-brand transition-colors"
													title="Edit required hours"
													style={{
														visibility: isHovered ? "visible" : "hidden",
													}}
												>
													<FaEdit size={12} />
												</button>
											</div>
										)}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
										{isLoading ? <Spinner /> : formatHours(workedHours)}
									</td>
									<td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${isLessWorked ? "text-red-800" : "text-green-800"}`}>
										{isLoading ? <Spinner /> : (gapHours > 0 ? "+" : "") + formatHours(gapHours)}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
										<Switch
											checked={offDay}
											onChange={() => {
												if (offDay) removeOffDay(date);
												else addOffDay(date);
											}}
											height={20}
											width={40}
											offColor="#e5e7eb"
											onColor="#10446F" 
											uncheckedIcon={false}
											checkedIcon={false}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot className="bg-gray-50">
						<tr>
							<th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Total</th>
							<th className="px-4 py-3"></th>
							<th className="px-4 py-3 text-left text-sm font-bold text-gray-900">{formatHours(totalRequiredHours)}</th>
							<th className="px-4 py-3 text-left text-sm font-bold text-gray-900">{isLoading ? <Spinner /> : formatHours(totalWorkedHours)}</th>
							<th className={`px-4 py-3 text-left text-sm font-bold ${isLessWorkedInTotal ? "text-red-800" : "text-green-800"}`}>
								{isLoading ? <Spinner /> : (totalGapHours > 0 ? "+" : "") + formatHours(totalGapHours)}
							</th>
							<th className="px-4 py-3"></th>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
}
