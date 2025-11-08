/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorSerializer } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';

export class AIWebBrowserInput extends EditorInput {
	static readonly ID = 'workbench.input.aiWebBrowser';

	private static INSTANCE_COUNTER = 0;
	private readonly instanceId: number;

	constructor() {
		super();
		this.instanceId = AIWebBrowserInput.INSTANCE_COUNTER++;
	}

	get typeId(): string {
		return AIWebBrowserInput.ID;
	}

	get resource(): URI | undefined {
		return URI.from({ scheme: 'ai-web-browser', path: `browser-${this.instanceId}` });
	}

	override getName(): string {
		return 'AI Web Browser';
	}

	override matches(other: unknown): boolean {
		if (other === this) {
			return true;
		}
		if (other instanceof AIWebBrowserInput) {
			return other.instanceId === this.instanceId;
		}
		return false;
	}

	static Factory: IEditorSerializer = {
		canSerialize(): boolean {
			return true;
		},

		serialize(input: EditorInput): string | undefined {
			if (input instanceof AIWebBrowserInput) {
				return JSON.stringify({
					instanceId: input.instanceId
				});
			}
			return undefined;
		},

		deserialize(instantiationService: IInstantiationService, serializedEditor: string): EditorInput | undefined {
			try {
				return new AIWebBrowserInput();
			} catch {
				return undefined;
			}
		}
	};
}
