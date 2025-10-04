export function navigate(path: string) {
	chrome.tabs.create({ url: chrome.runtime.getURL(path) });
}
