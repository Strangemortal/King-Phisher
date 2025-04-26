const API_BASE_URL = "https://api.kingphisher.ai/v1";
const CACHE_DURATION = 3600000; // 1 hour in ms

export class ApiService {
	constructor() {
		this.cache = new Map();
		this.apiKey = null;
	}

	async init() {
		const settings = await chrome.storage.local.get(["apiKey"]);
		this.apiKey = settings.apiKey;
	}

	async checkUrlSafety(url) {
		const cacheKey = `url:${url}`;
		const cached = this.cache.get(cacheKey);

		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			return cached.data;
		}

		try {
			const response = await this._makeRequest("/url/check", { url });
			const result = {
				isSafe: response.safetyScore < 0.3,
				safetyScore: response.safetyScore,
				details: response.details,
			};

			this.cache.set(cacheKey, {
				data: result,
				timestamp: Date.now(),
			});

			return result;
		} catch (error) {
			console.error("URL check failed:", error);
			return {
				isSafe: true,
				error: error.message,
			};
		}
	}

	async submitFeedback(emailId, isCorrect, userComment) {
		return this._makeRequest("/feedback", {
			emailId,
			isCorrect,
			userComment,
			source: "extension",
		});
	}

	async checkForModelUpdates(currentVersion) {
		return this._makeRequest("/model/updates", { currentVersion });
	}

	async _makeRequest(endpoint, body) {
		const url = `${API_BASE_URL}${endpoint}`;
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.apiKey}`,
		};

		const response = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		return response.json();
	}
}

// Singleton instance
export const apiService = new ApiService();
