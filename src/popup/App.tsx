import Overview from "../components/Overview";
import { navigate } from "../utils/navigate";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";
import { WeeklyRequiredHoursProvider } from "../hooks/useWeeklyRequiredHours";
import { TRACKER_WEB_URL } from "../utils/api";

export default function App() {
	return (
		<WeeklyRequiredHoursProvider>
			<div className="w-sm min-h-[480px] p-8 bg-gradient-to-b from-[#A7DEFD] to-[#10446F] relative">
				<a
					href={TRACKER_WEB_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute top-4 right-4 text-[#10446f]/50 hover:text-[#10446f] transition-colors cursor-pointer"
					title="Open TopTracker"
				>
					<FaExternalLinkAlt size={14} />
				</a>
				<Overview />
				<button
					onClick={() => navigate("index.html")}
					className="py-3 px-5 mt-4 w-full hover:-translate-y-0.5 flex justify-center items-center gap-2 bg-[#A7DEFD] text-[#10446F] font-semibold rounded-xl cursor-pointer active:scale-95 transition"
				>
					See Details
					<FaArrowRight />
				</button>
			</div>
		</WeeklyRequiredHoursProvider>
	);
}
