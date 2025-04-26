const LOG_LEVELS = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	critical: 4,
};

export class Logger {
	constructor() {
		this.logLevel = LOG_LEVELS.info;
		this.maxLogSize = 1000;
		this.logCache = [];
	}

	async init() {
		const settings = await chrome.storage.local.get(["logLevel"]);
		this.logLevel = LOG_LEVELS[settings.logLevel] || LOG_LEVELS.info;
	}

	log(message, level = "info", metadata = {}) {
		const levelValue = LOG_LEVELS[level] || LOG_LEVELS.info;

		if (levelValue >= this.logLevel) {
			const entry = {
				timestamp: new Date().toISOString(),
				message,
				level,
				...metadata,
			};

			console[level](`[King-Phisher] ${message}`, metadata);
			this._storeLog(entry);
		}
	}

	_storeLog(entry) {
		this.logCache.push(entry);
		if (this.logCache.length > this.maxLogSize) {
			this.logCache.shift();
		}

		// In a real implementation, would also send to remote logging service
	}

	async getLogs(filter = {}) {
		if (filter.level) {
			const levelValue = LOG_LEVELS[filter.level];
			return this.logCache.filter(
				(entry) => LOG_LEVELS[entry.level] >= levelValue
			);
		}
		return [...this.logCache];
	}

	// Convenience methods
	debug(message, metadata) {
		this.log(message, "debug", metadata);
	}

	info(message, metadata) {
		this.log(message, "info", metadata);
	}

	warn(message, metadata) {
		this.log(message, "warn", metadata);
	}

	error(message, metadata) {
		this.log(message, "error", metadata);
	}

	critical(message, metadata) {
		this.log(message, "critical", metadata);
		// In a real implementation, would trigger alerts
	}
}

// Singleton instance
export const logger = new Logger();

export function logEvent(message, level = "info", metadata = {}) {
	logger.log(message, level, metadata);
}

