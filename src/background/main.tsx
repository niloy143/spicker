// Background script to handle redirects after login

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// Check if the tab has completed loading and is on the TopTracker domain
	if (changeInfo.status === 'complete' && tab.url && tab.url.includes('tracker.toptal.com')) {
		// If we are on the tracker site, but NOT on the signin page, we are likely logged in.
		// The signin page is https://tracker.toptal.com/signin/
		// The app is usually https://tracker.toptal.com/app/... or similar
		
		// We avoid redirecting if we are still on the signin page
		if (!tab.url.includes('/signin')) {
			chrome.storage.local.get(['pending_login_redirect'], (result) => {
				if (result.pending_login_redirect) {
					// We have a pending redirect from our extension
					
					// Update the tab to go back to the extension dashboard
					const dashboardUrl = chrome.runtime.getURL('index.html');
					chrome.tabs.update(tabId, { url: dashboardUrl });
					
					// Clear the flag so we don't redirect again unnecessarily
					chrome.storage.local.remove('pending_login_redirect');
				}
			});
		}
	}
});
