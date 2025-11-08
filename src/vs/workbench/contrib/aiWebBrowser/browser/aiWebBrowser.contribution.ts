/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.js';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { localize } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.js';
import { EditorExtensions } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { AIWebBrowserEditor } from './aiWebBrowserEditor.js';
import { AIWebBrowserInput } from './aiWebBrowserInput.js';

Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane).registerEditorPane(
	EditorPaneDescriptor.create(
		AIWebBrowserEditor,
		AIWebBrowserEditor.ID,
		localize('aiWebBrowser', "AI Web Browser")
	),
	[
		new SyncDescriptor(AIWebBrowserInput)
	]
);

class OpenAIWebBrowserAction extends Action2 {
	constructor() {
		super({
			id: 'workbench.action.openAIWebBrowser',
			title: { value: localize('openAIWebBrowser', "Open AI Web Browser"), original: 'Open AI Web Browser' },
			category: Categories.View,
			f1: true,
			keybinding: {
				weight: KeybindingWeight.WorkbenchContrib,
				primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyB
			}
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const editorService = accessor.get(IEditorService);
		const input = new AIWebBrowserInput();
		await editorService.openEditor(input, { pinned: true });
	}
}

registerAction2(OpenAIWebBrowserAction);
