import { getTrackerAccessToken } from "./cookies";
import { dateString } from "./dates";

export const SIGNIN_URL = `https://tracker.toptal.com/signin/`;
export const BASE_URL = `https://tracker-api.toptal.com`;
export const TRACKER_URL = `${BASE_URL}/activities/my`;
export const PROJECTS_URL = `${BASE_URL}/web/projects`;
export const TRACKER_WEB_URL = `https://tracker.toptal.com/`;

async function getProjects() {
	try {
		const accessToken = await getTrackerAccessToken();

		let query = `archived=true`;
		query += `&access_token=${accessToken}`;

		const res = await fetch(`${PROJECTS_URL}/?${query}`);
		if (res.status === 401 || res.status === 403) {
			const isPopup = window.location.pathname.includes("popup.html");
			
			// Set flag to track that we initiated this redirect
			await chrome.storage.local.set({ pending_login_redirect: true });

			if (isPopup) {
				chrome.tabs.create({ url: SIGNIN_URL });
			} else {
				window.location.href = SIGNIN_URL;
			}
			return [];
		}

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

	if (!res.ok) throw {};

	return dates;
}
