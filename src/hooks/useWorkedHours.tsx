import { useQuery } from "@tanstack/react-query";
import { getWorkedHours, WorkedHour } from "../utils/api";

const KEY = "worked-hours";

export default function useWorkedHours(startDate: Date, endDate: Date) {
	const { data: workedHours, ...query } = useQuery<WorkedHour[]>({
		queryKey: [KEY, startDate, endDate],
		queryFn: async () => {
			const hours = await getWorkedHours(startDate, endDate);
			return hours;
		},
	});

	return { workedHours, ...query };
}
