import Stats from "../components/Stats";
import { WeeklyRequiredHoursProvider } from "../hooks/useWeeklyRequiredHours";

export default function App() {
	return (
		<WeeklyRequiredHoursProvider>
			<div className="p-5 min-h-screen bg-gradient-to-b from-[#A7DEFD] to-[#10446F]">
				<Stats />
			</div>
		</WeeklyRequiredHoursProvider>
	);
}
