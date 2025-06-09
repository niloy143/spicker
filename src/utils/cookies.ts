/**
 * Get the tracker access token from cookies
 * @returns Promise<string> The access token or empty string if not found
 */
export const getTrackerAccessToken = async (): Promise<string> => {
	try {
		const cookie = await chrome.cookies.get({
			name: "tracker_access_token",
			url: "https://tracker.toptal.com",
		});
		return cookie?.value || "";
	} catch (error) {
		return "";
	}
};
