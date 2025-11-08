/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.js';
import { Dimension, IDomPosition } from '../../../../base/browser/dom.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';

export class AIWebBrowserEditor extends EditorPane {
	static readonly ID = 'workbench.editor.aiWebBrowser';

	private container: HTMLElement | undefined;
	private webviewElement: HTMLIFrameElement | undefined;
	private urlInput: HTMLInputElement | undefined;
	private chatMessages: HTMLElement | undefined;
	private chatInput: HTMLTextAreaElement | undefined;
	private apiKeyInput: HTMLInputElement | undefined;
	private currentUrl: string = '';

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService private readonly storageService: IStorageService,
		@INotificationService private readonly notificationService: INotificationService
	) {
		super(AIWebBrowserEditor.ID, group, telemetryService, themeService, storageService);
	}

	protected override createEditor(parent: HTMLElement): void {
		this.container = dom.append(parent, dom.$('.ai-web-browser-container'));

		// Main layout: Browser (left 80%) + Chat (right 20%)
		const mainLayout = dom.append(this.container, dom.$('.main-layout'));

		// Browser Panel (80%)
		const browserPanel = dom.append(mainLayout, dom.$('.browser-panel'));
		this.createBrowserPanel(browserPanel);

		// Chat Panel (20%)
		const chatPanel = dom.append(mainLayout, dom.$('.chat-panel'));
		this.createChatPanel(chatPanel);

		this.applyStyles();
	}

	private createBrowserPanel(parent: HTMLElement): void {
		// URL input section
		const urlSection = dom.append(parent, dom.$('.url-section'));

		this.urlInput = dom.append(urlSection, dom.$('input.url-input')) as HTMLInputElement;
		this.urlInput.type = 'text';
		this.urlInput.placeholder = 'Enter URL (e.g., https://vnexpress.net)';
		this.urlInput.value = 'https://vnexpress.net';

		const loadButton = dom.append(urlSection, dom.$('button.load-button'));
		loadButton.textContent = 'Load';
		loadButton.onclick = () => this.loadUrl();

		this.urlInput.onkeydown = (e) => {
			if (e.key === 'Enter') {
				this.loadUrl();
			}
		};

		// Webview container
		const webviewContainer = dom.append(parent, dom.$('.webview-container'));
		this.webviewElement = dom.append(webviewContainer, dom.$('iframe.webview')) as HTMLIFrameElement;
		this.webviewElement.sandbox.add('allow-same-origin', 'allow-scripts', 'allow-forms', 'allow-popups');
	}

	private loadUrl(): void {
		if (!this.urlInput || !this.webviewElement) { return; }

		let url = this.urlInput.value.trim();
		if (!url) { return; }

		// Add https:// if no protocol specified
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			url = 'https://' + url;
		}

		this.currentUrl = url;
		this.webviewElement.src = url;

		this.addMessage('system', `Loading ${url}...`);
	}

	private createChatPanel(parent: HTMLElement): void {
		// API Key section
		const apiKeySection = dom.append(parent, dom.$('.api-key-section'));
		const apiKeyLabel = dom.append(apiKeySection, dom.$('label.api-key-label'));
		apiKeyLabel.textContent = 'API Key:';

		this.apiKeyInput = dom.append(apiKeySection, dom.$('input.api-key-input')) as HTMLInputElement;
		this.apiKeyInput.type = 'password';
		this.apiKeyInput.placeholder = 'Enter OpenAI or Anthropic API key';

		// Load saved API key
		const savedKey = this.storageService.get('aiWebBrowser.apiKey', 0, '');
		if (savedKey) {
			this.apiKeyInput.value = savedKey;
		}

		this.apiKeyInput.onchange = () => {
			this.storageService.store('aiWebBrowser.apiKey', this.apiKeyInput!.value, 0, 0);
		};

		// Provider selection
		const providerSection = dom.append(parent, dom.$('.provider-section'));
		const providerLabel = dom.append(providerSection, dom.$('label.provider-label'));
		providerLabel.textContent = 'Provider:';

		const providerSelect = dom.append(providerSection, dom.$('select.provider-select')) as HTMLSelectElement;
		const openaiOption = dom.append(providerSelect, dom.$('option')) as HTMLOptionElement;
		openaiOption.value = 'openai';
		openaiOption.textContent = 'OpenAI';
		const anthropicOption = dom.append(providerSelect, dom.$('option')) as HTMLOptionElement;
		anthropicOption.value = 'anthropic';
		anthropicOption.textContent = 'Anthropic';

		// Chat messages area
		this.chatMessages = dom.append(parent, dom.$('.chat-messages'));

		// Chat input section
		const chatInputSection = dom.append(parent, dom.$('.chat-input-section'));

		this.chatInput = dom.append(chatInputSection, dom.$('textarea.chat-input')) as HTMLTextAreaElement;
		this.chatInput.placeholder = 'Ask about the website...';
		this.chatInput.rows = 3;

		const sendButton = dom.append(chatInputSection, dom.$('button.send-button'));
		sendButton.textContent = 'Send';
		sendButton.onclick = () => this.sendMessage(providerSelect.value);

		this.chatInput.onkeydown = (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage(providerSelect.value);
			}
		};
	}

	private applyStyles(): void {
		if (!this.container) { return; }

		const style = document.createElement('style');
		style.textContent = `
			.ai-web-browser-container {
				display: flex;
				flex-direction: column;
				width: 100%;
				height: 100%;
				overflow: hidden;
			}

			.main-layout {
				display: flex;
				flex: 1;
				overflow: hidden;
			}

			.browser-panel {
				width: 80%;
				display: flex;
				flex-direction: column;
				border-right: 1px solid var(--vscode-panel-border);
			}

			.chat-panel {
				width: 20%;
				display: flex;
				flex-direction: column;
				padding: 10px;
				background: var(--vscode-sideBar-background);
			}

			.url-section {
				display: flex;
				padding: 10px;
				gap: 10px;
				background: var(--vscode-editor-background);
				border-bottom: 1px solid var(--vscode-panel-border);
			}

			.url-input {
				flex: 1;
				padding: 6px 10px;
				background: var(--vscode-input-background);
				color: var(--vscode-input-foreground);
				border: 1px solid var(--vscode-input-border);
				border-radius: 3px;
			}

			.load-button, .send-button {
				padding: 6px 16px;
				background: var(--vscode-button-background);
				color: var(--vscode-button-foreground);
				border: none;
				border-radius: 3px;
				cursor: pointer;
			}

			.load-button:hover, .send-button:hover {
				background: var(--vscode-button-hoverBackground);
			}

			.webview-container {
				flex: 1;
				position: relative;
				overflow: hidden;
			}

			.webview {
				width: 100%;
				height: 100%;
				border: none;
			}

			.api-key-section, .provider-section {
				margin-bottom: 10px;
			}

			.api-key-label, .provider-label {
				display: block;
				margin-bottom: 5px;
				font-size: 12px;
				color: var(--vscode-foreground);
			}

			.api-key-input, .provider-select {
				width: 100%;
				padding: 6px 8px;
				background: var(--vscode-input-background);
				color: var(--vscode-input-foreground);
				border: 1px solid var(--vscode-input-border);
				border-radius: 3px;
				font-size: 12px;
			}

			.chat-messages {
				flex: 1;
				overflow-y: auto;
				margin-bottom: 10px;
				padding: 10px;
				background: var(--vscode-editor-background);
				border: 1px solid var(--vscode-panel-border);
				border-radius: 3px;
			}

			.message {
				margin-bottom: 15px;
				padding: 8px;
				border-radius: 4px;
			}

			.message.user {
				background: var(--vscode-button-secondaryBackground);
				text-align: right;
			}

			.message.assistant {
				background: var(--vscode-editor-background);
			}

			.message.error {
				background: var(--vscode-inputValidation-errorBackground);
				color: var(--vscode-inputValidation-errorForeground);
			}

			.message-role {
				font-weight: bold;
				font-size: 11px;
				margin-bottom: 4px;
				color: var(--vscode-descriptionForeground);
			}

			.message-content {
				font-size: 13px;
				line-height: 1.5;
				color: var(--vscode-foreground);
			}

			.chat-input-section {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}

			.chat-input {
				width: 100%;
				padding: 8px;
				background: var(--vscode-input-background);
				color: var(--vscode-input-foreground);
				border: 1px solid var(--vscode-input-border);
				border-radius: 3px;
				resize: vertical;
				font-family: var(--vscode-font-family);
				font-size: 13px;
			}

			.send-button {
				align-self: flex-end;
				width: 100%;
			}
		`;
		this.container.appendChild(style);
	}

	private async sendMessage(provider: string): Promise<void> {
		if (!this.chatInput || !this.apiKeyInput) { return; }

		const message = this.chatInput.value.trim();
		if (!message) { return; }

		const apiKey = this.apiKeyInput.value.trim();
		if (!apiKey) {
			this.notificationService.error('Please enter an API key first');
			return;
		}

		if (!this.currentUrl) {
			this.notificationService.error('Please load a website first');
			return;
		}

		// Add user message
		this.addMessage('user', message);
		this.chatInput.value = '';

		// Get page content
		const pageContent = await this.getPageContent();

		// Call LLM API
		try {
			const response = await this.callLLMAPI(provider, apiKey, message, pageContent);
			this.addMessage('assistant', response);
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.addMessage('error', `Error: ${error.message}`);
			}
		}
	}

	private async getPageContent(): Promise<string> {
		// Try to get content from iframe
		try {
			if (this.webviewElement && this.webviewElement.contentDocument) {
				const doc = this.webviewElement.contentDocument;
				const text = doc.body?.innerText || '';
				return text.substring(0, 10000);
			}
		} catch (e) {
			// CORS restriction - can't access iframe content
			// Return URL info instead
		}

		return `Current URL: ${this.currentUrl}\n(Note: Cannot extract content due to CORS restrictions. The LLM will work with the URL context.)`;
	}

	private async callLLMAPI(provider: string, apiKey: string, userMessage: string, pageContent: string): Promise<string> {
		if (provider === 'openai') {
			return this.callOpenAI(apiKey, userMessage, pageContent);
		} else if (provider === 'anthropic') {
			return this.callAnthropic(apiKey, userMessage, pageContent);
		}
		throw new Error('Unknown provider');
	}

	private async callOpenAI(apiKey: string, userMessage: string, pageContent: string): Promise<string> {
		const messages = [
			{
				role: 'system',
				content: 'You are a helpful assistant that answers questions about web pages. The user is viewing a website and will ask questions about it.'
			},
			{
				role: 'user',
				content: `Website content:\n${pageContent}\n\nUser question: ${userMessage}`
			}
		];

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo',
				messages: messages,
				max_tokens: 1000
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error?.message || 'API request failed');
		}

		const data = await response.json();
		return data.choices[0].message.content;
	}

	private async callAnthropic(apiKey: string, userMessage: string, pageContent: string): Promise<string> {
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-3-sonnet-20240229',
				max_tokens: 1000,
				messages: [{
					role: 'user',
					content: `Website content:\n${pageContent}\n\nUser question: ${userMessage}`
				}]
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error?.message || 'API request failed');
		}

		const data = await response.json();
		return data.content[0].text;
	}

	private addMessage(role: string, content: string): void {
		if (!this.chatMessages) { return; }

		const messageDiv = dom.append(this.chatMessages, dom.$('.message'));
		messageDiv.classList.add(role);

		const roleSpan = dom.append(messageDiv, dom.$('.message-role'));
		roleSpan.textContent = role.toUpperCase();

		const contentDiv = dom.append(messageDiv, dom.$('.message-content'));
		contentDiv.textContent = content;

		// Scroll to bottom
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	override layout(dimension: Dimension, position?: IDomPosition): void {
		if (!this.container) {
			return;
		}
		this.container.style.width = `${dimension.width}px`;
		this.container.style.height = `${dimension.height}px`;
	}
}
