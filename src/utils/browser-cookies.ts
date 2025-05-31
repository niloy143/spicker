/**
 * Get the tracker access token from cookies in browser context
 * @returns string The access token or an empty string if not found
 */
export const getAccessToken = (): string => {
	const trackerKey = "tracker_access_token";
	let accessToken = "";

	try {
		document.cookie.split(";").forEach((cookieStr) => {
			let [key, value] = cookieStr.split("=");
			key = key.trim();
			value = value.trim();
			if (key === trackerKey) {
				accessToken = value;
			}
		});
	} catch {}

	return accessToken;
};
