/**
 * Get the tracker access token from cookies
 * @returns Promise<string | null> The access token or null if not found
 */
export const getTrackerAccessToken = async (): Promise<string | null> => {
	try {
		const cookie = await chrome.cookies.get({
			name: "tracker_access_token",
			url: "https://tracker.toptal.com",
		});
		return cookie?.value || null;
	} catch (error) {
		return null;
	}
};
