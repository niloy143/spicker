import { useWeeklyRequiredHours } from "../../hooks/useWeeklyRequiredHours";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const WeeklyHoursInput = () => {
	const { weeklyRequiredHours, updateWeeklyRequiredHours } = useWeeklyRequiredHours();

	return (
		<div className="flex flex-col items-center">
			<label className="font-medium my-2">Weekly Required Hours</label>
			<div className="flex space-x-2">
				{days.map((day, index) => (
					<div key={day} className="flex flex-col items-center gap-1">
						<input
							type="number"
							value={weeklyRequiredHours[index]}
							onChange={(e) => {
								const newHours = [...weeklyRequiredHours];
								newHours[index] = parseFloat(e.target.value) || 0;
								updateWeeklyRequiredHours(newHours);
							}}
							className="w-10 h-10 text-center border border-gray-300 rounded focus:border-2 focus:border-brand focus:outline-none appearance-none"
							min={0}
							max={24}
							step={1}
						/>
						<span className="text-xs text-gray-500">{day}</span>
					</div>
				))}
			</div>
		</div>
	);
};
