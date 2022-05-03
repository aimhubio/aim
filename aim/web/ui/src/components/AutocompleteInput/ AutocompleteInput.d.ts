import * as monaco from 'monaco-editor';

import { EditorProps } from '@monaco-editor/react';

export interface IAutocompleteInputProps {
  context: Record<any, any>;
  onEnter?: () => void;
  className?: string;
  monacoProps?: EditorProps;
  onChange?: (
    val: string,
    ev?: monaco.editor.IModelContentChangedEvent,
  ) => void;
}
