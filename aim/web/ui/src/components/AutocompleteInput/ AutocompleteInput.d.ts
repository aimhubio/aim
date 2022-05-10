import * as monaco from 'monaco-editor';

import { EditorProps } from '@monaco-editor/react';

export interface IAutocompleteInputProps {
  context: Record<any, any>;
  className?: string;
  editorProps?: EditorProps;
  advanced?: boolean;
  value: string | undefined;
  onEnter?: () => void;
  onChange: (val: string, ev?: monaco.editor.IModelContentChangedEvent) => void;
}
