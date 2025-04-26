class EmailObserver {
	constructor() {
		this.observer = null;
		this.currentEmails = new Set();
		this.init();
	}

	init() {
		this.setupMutationObserver();
		this.setupLinkHandlers();
		this.injectWarningStyles();
	}

	setupMutationObserver() {
		this.observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'childList') {
					this.processNewNodes(mutation.addedNodes);
				}
			});
		});

		this.observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false
		});
	}

	processNewNodes(nodes) {
		nodes.forEach((node) => {
			if (node.nodeType !== Node.ELEMENT_NODE) return;

			// Gmail-specific selectors
			const emailElements = node.querySelectorAll?.('[role="article"], .email-content') || [];

			emailElements.forEach(async (emailElement) => {
				const emailId = this.generateEmailId(emailElement);
				if (this.currentEmails.has(emailId)) return;

				this.currentEmails.add(emailId);
				await this.analyzeEmailElement(emailElement);
			});
		});
	}

	async analyzeEmailElement(element) {
		try {
			const emailContent = this.extractEmailContent(element);
			const response = await chrome.runtime.sendMessage({
				type: 'ANALYZE_EMAIL',
				content: emailContent
			});

			if (response.isPhishing) {
				this.markAsPhishing(element, response.confidence);
				this.playWarningSound();
			}
		} catch (error) {
			console.error('PhishShield analysis error:', error);
		}
	}

	extractEmailContent(element) {
		// Clean text by removing signatures, quoted text etc.
		const clone = element.cloneNode(true);
		clone.querySelectorAll('.gmail_quote, .signature, blockquote').forEach(el => el.remove());
		return clone.textContent
			.replace(/\s+/g, ' ')
			.trim();
	}

	markAsPhishing(element, confidence) {
		element.style.borderLeft = '4px solid #ff3b30';
		element.style.position = 'relative';

		const warningBanner = document.createElement('div');
		warningBanner.className = 'phishshield-warning';
		warningBanner.innerHTML = `
		<div style="
		  background: #fff8f8;
		  padding: 8px 12px;
		  border-radius: 4px;
		  margin: 8px 0;
		  display: flex;
		  align-items: center;
		  border: 1px solid #ff3b30;
		">
		  <span style="color: #ff3b30; margin-right: 8px;">⚠️</span>
		  <span style="flex-grow: 1;">
			PhishShield detected a suspicious email (${Math.round(confidence * 100)}% confidence)
		  </span>
		  <button style="
			background: #ff3b30;
			color: white;
			border: none;
			padding: 4px 8px;
			border-radius: 4px;
			cursor: pointer;
		  ">Report</button>
		</div>
	  `;

		element.prepend(warningBanner);
	}

	playWarningSound() {
		const audio = new Audio(chrome.runtime.getURL('assets/warning-sound.mp3'));
		audio.volume = 0.3;
		audio.play().catch(() => { });
	}

	setupLinkHandlers() {
		document.addEventListener('click', async (event) => {
			let target = event.target;
			while (target && target !== document) {
				if (target.tagName === 'A' && target.href) {
					event.preventDefault();
					const isSafe = await this.verifyLinkSafety(target.href);
					if (isSafe) {
						window.open(target.href, '_blank');
					}
					return;
				}
				target = target.parentNode;
			}
		}, true);
	}

	async verifyLinkSafety(url) {
		try {
			const response = await chrome.runtime.sendMessage({
				type: 'VERIFY_URL',
				url: url
			});
			return response.isSafe;
		} catch (error) {
			console.error('URL verification failed:', error);
			return true; // Fail open
		}
	}

	injectWarningStyles() {
		const style = document.createElement('style');
		style.textContent = `
		.phishshield-warning {
		  animation: phishshield-pulse 2s infinite;
		}
		@keyframes phishshield-pulse {
		  0% { opacity: 1; }
		  50% { opacity: 0.8; }
		  100% { opacity: 1; }
		}
	  `;
		document.head.appendChild(style);
	}

	generateEmailId(element) {
		// Generate unique ID based on email content and position
		return btoa(
			element.textContent.substring(0, 50) +
			Array.from(element.classList).join('') +
			(element.getAttribute('id') || '')
				.replace(/[^a-zA-Z0-9]/g, ''));
	}
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => new EmailObserver());
} else {
	new EmailObserver();
}