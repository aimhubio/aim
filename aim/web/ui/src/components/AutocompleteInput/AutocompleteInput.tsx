import React from 'react';
import * as monaco from 'monaco-editor';
import classNames from 'classnames';

import Editor, { useMonaco, loader } from '@monaco-editor/react';

import { MonacoConfig } from 'config/monacoConfig/monacoConfig';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './ AutocompleteInput';

import './AutocompleteInput.scss';

// loading monaco from node modules instead of CDN
// loader.config({ monaco });

function AutocompleteInput({
  context,
  className,
  monacoProps = {},
  //callback functions
  onEnter,
  onChange,
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

    // monacoInstance?.editor.defineTheme('myTheme', MonacoConfig.theme);
    // monacoInstance?.editor.setTheme('myTheme');
    editorRef.current.onDidFocusEditorWidget(() => {
      setFocused(true);
    });
    editorRef.current.onDidBlurEditorWidget(() => {
      setFocused(false);
    });
  }

  React.useEffect(() => {
    if (focused) {
      editorRef.current?.focus();
      monacoInstance?.editor.defineTheme('myTheme', MonacoConfig.theme);
      monacoInstance?.editor.setTheme('myTheme');
    }
  }, [focused]);
  function handleChange(
    val: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent,
  ) {
    if (typeof val === 'string') {
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

  function handleBeforeMount() {}
  return (
    <div
      onClick={() => setFocused(true)}
      className={classNames(`AutocompleteInput ${className || ''}`, {
        AutocompleteInput__focused: focused,
      })}
    >
      <Editor
        language='python'
        height={MonacoConfig.height}
        value={value}
        onChange={handleChange}
        onMount={handleDidMount}
        loading={<span></span>}
        options={MonacoConfig.options}
        beforeMount={handleBeforeMount}
        // {...monacoProps}
      />
      {!focused && !value && (
        <div className='AutocompleteInput__placeholder'>
          {
            'Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
          }
        </div>
      )}
    </div>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';

export default React.memo(AutocompleteInput);
