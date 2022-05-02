import React from 'react';
import * as monaco from 'monaco-editor';
import classNames from 'classnames';

import Editor, { useMonaco, loader } from '@monaco-editor/react';

import { MonacoConfig } from 'config/monacoConfig/monacoConfig';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './ AutocompleteInput';

import './AutocompleteInput.scss';

// loading monaco from node modules instead of CDN
loader.config({ monaco });

function AutocompleteInput({
  context,
  onEnter,
  className,
  onChange,
  monacoProps = {},
}: IAutocompleteInputProps) {
  const [focused, setFocused] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string>('');
  const monacoInstance: any = useMonaco();
  const editorRef = React.useRef<any>();

  React.useEffect(() => {
    // inserting given object for autosuggestion
    const disposable = showAutocompletion(monacoInstance, context);
    return disposable?.dispose;
  }, [monacoInstance, context]);

  function handleDidMount(editor: any) {
    editorRef.current = editor;
    editorRef.current.onDidFocusEditorWidget(() => {
      setFocused(true);
    });
    editorRef.current.onDidBlurEditorWidget(() => {
      setFocused(false);
    });
  }

  function handleChange(
    val: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent,
  ) {
    if (val) {
      // formatting value to avoid the new line
      let formatted = val.replace(/[\n\r]/g, '');
      if (ev.changes[0].text === '\n') {
        editorRef.current!.setValue(formatted);
        if (onEnter) {
          onEnter();
        }
      }
      setValue(formatted);
      if (onChange) {
        onChange(formatted, ev);
      }
    }
  }

  return (
    <div
      className={classNames(`AutocompleteInput ${className || ''}`, {
        focused,
      })}
    >
      <Editor
        language='python'
        height={MonacoConfig.height}
        value={value}
        onChange={handleChange}
        onMount={handleDidMount}
        options={MonacoConfig.options}
        {...monacoProps}
      />
    </div>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';

export default React.memo(AutocompleteInput);
