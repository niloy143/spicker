import { getTrackerAccessToken } from "./cookies";
import { dateString } from "./dates";

export const BASE_URL = `https://tracker-api.toptal.com`;
export const TRACKER_URL = `${BASE_URL}/activities/my`;
export const PROJECTS_URL = `${BASE_URL}/web/projects`;

async function getProjects() {
	try {
		const accessToken = await getTrackerAccessToken();

		let query = `archived=true`;
		query += `&access_token=${accessToken}`;

		const res = await fetch(`${PROJECTS_URL}/?${query}`);
		const projects = await res.json();

		return projects?.projects || [];
	} catch (e) {
		return [];
	}
}

export type WorkedHour = {
	date: string;
	total: number;
};

export async function getWorkedHours(startDate: Date, endDate: Date): Promise<WorkedHour[]> {
	try {
		const projects = await getProjects();
		const projectIds = projects.map((project) => project.id);

		const start_date = dateString(startDate);
		const end_date = dateString(endDate);

		const accessToken = await getTrackerAccessToken();

		let query = `start_date=${start_date}`;
		query += `&end_date=${end_date}`;
		query += `&${projectIds.map((id) => `project_ids[]=${id}`).join("&")}`;
		query += `&access_token=${accessToken}`;

		const res = await fetch(`${TRACKER_URL}/?${query}`);
		const { dates } = await res.json();

		return dates;
	} catch (e) {
		return [];
	}
}
