import { createRoot } from "react-dom/client";
import { sleep } from "../utils/sleep";
import SpickerReportsBtn from "./components/SpickerReportsBtn";

async function run() {
	let exportBtnPdf: HTMLAnchorElement | null = null;

	while (!exportBtnPdf) {
		exportBtnPdf = document.querySelector(".reports_export_button.is-pdf");
		await sleep(300);
	}

	const spickerReportsBtn = document.createElement("a");
	exportBtnPdf?.parentNode?.insertBefore(spickerReportsBtn, exportBtnPdf);

	const root = createRoot(spickerReportsBtn);
	root.render(<SpickerReportsBtn />);
}

run().catch(console.log);
