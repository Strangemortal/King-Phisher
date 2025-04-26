const DEFAULT_SETTINGS = {
	realTimeProtection: true,
	linkProtection: true,
	modelVersion: "1.0",
	lastUpdated: Date.now(),
	whitelistedDomains: [],
	stats: {
	  emailsScanned: 0,
	  threatsDetected: 0,
	  lastScanDate: null,
	},
  };
  
  export class StorageService {
	constructor() {
	  this.ready = this._initialize();
	}
  
	
	async _initialize() {
	  const settings = await this.getUserSettings();
	  if (!settings) {
		await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
	  }
	  return true;
	}
  
	
	async getUserSettings() {
	  await this.ready;
	  const result = await chrome.storage.local.get(["settings"]);
	  return result.settings || DEFAULT_SETTINGS;
	}
  
	
	async updateSettings(updates) {
	  await this.ready;
	  const current = await this.getUserSettings();
	  const newSettings = { ...current, ...updates };
	  await chrome.storage.local.set({ settings: newSettings });
	  return newSettings;
	}
  
	
	async incrementStat(statName, amount = 1) {
	  await this.ready;
	  const current = await this.getUserSettings();
	  const newStats = {
		...current.stats,
		[statName]: (current.stats[statName] || 0) + amount,
		lastScanDate: Date.now(),
	  };
	  return this.updateSettings({ stats: newStats });
	}

	async whitelistDomain(domain) {
	  await this.ready;
	  const current = await this.getUserSettings();
	  
	  if (!current.whitelistedDomains.includes(domain)) {
		const whitelist = [...current.whitelistedDomains, domain];
		return this.updateSettings({ whitelistedDomains: whitelist });
	  }
	  return current;
	}
  
	
	async resetToDefaults() {
	  await chrome.storage.local.clear();
	  return this._initialize();
	}
  }
  
  
  export const storageService = new StorageService();
  