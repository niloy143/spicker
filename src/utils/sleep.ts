export async function sleep(ms = 300) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, ms);
	});
}
