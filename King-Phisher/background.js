import { PhishingDetector } from "./ai-model/model.js";
import { logEvent } from "./utils/logger.js";
import { checkUrlSafety } from "./utils/api.js";
import { getUserSettings, updateModel } from "./utils/storage.js";

const detector = new PhishingDetector();
let isInitialized = false;

chrome.runtime.onInstalled.addListener(async () => {
	console.log("King-Phisher extension installed");
	await chrome.storage.local.clear();
	await initializeDetector();
	scheduleDailyUpdate();
	logEvent("Extension installed or updated");
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	try {
		switch (request.type) {
			case "ANALYZE_EMAIL":
				const analysis = await detector.analyze(request.content);
				sendResponse(analysis);
				break;

			case "VERIFY_URL":
				const safetyReport = await checkUrlSafety(request.url);
				sendResponse(safetyReport);
				break;

			case "GET_SETTINGS":
				sendResponse(await getUserSettings());
				break;

			default:
				sendResponse({ error: "Invalid request type" });
		}
	} catch (error) {
		logEvent(`Background error: ${error.message}`, "error");
		sendResponse({ error: error.message });
	}
	return true;
});

async function initializeDetector() {
	try {
		if (!isInitialized) {
			await detector.loadModel();
			await detector.warmUp();
			isInitialized = true;
			logEvent("AI model initialized");
		}
	} catch (error) {
		logEvent(`Model initialization failed: ${error.message}`, "critical");
	}
}

function scheduleDailyUpdate() {
	chrome.alarms.create("modelUpdate", {
		periodInMinutes: 1440,
		delayInMinutes: 1,
	});

	chrome.alarms.onAlarm.addListener(async (alarm) => {
		if (alarm.name === "modelUpdate") {
			try {
				await updateModel();
				logEvent("Model updated successfully");
			} catch (error) {
				logEvent(`Model update failed: ${error.message}`, "error");
			}
		}
	});
}

chrome.webNavigation.onBeforeNavigate.addListener(
	async (details) => {
		if (details.frameId === 0) {
			const settings = await getUserSettings();
			if (settings.realTimeUrlProtection) {
				const safetyReport = await checkUrlSafety(details.url);
				if (!safetyReport.isSafe) {
					chrome.tabs.update(details.tabId, { url: "blocked.html" });
					showWarningNotification(details.url);
				}
			}
		}
	},
	{ url: [{ schemes: ["http", "https"] }] }
);

function showWarningNotification(unsafeUrl) {
	chrome.notifications.create({
		type: "basic",
		iconUrl: "assets/icons/warning128.png",
		title: "Phishing Attempt Blocked",
		message: `Access to ${new URL(unsafeUrl).hostname} was blocked`,
		buttons: [{ title: "Learn More" }],
		priority: 2,
	});
}
