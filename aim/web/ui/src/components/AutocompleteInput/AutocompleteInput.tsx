import React from 'react';
import classNames from 'classnames';

import Editor, { useMonaco } from '@monaco-editor/react';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './ AutocompleteInput';

import './AutocompleteInput.scss';

// loading monaco from node modules instead of CDN
// loader.config({ monaco });
function AutocompleteInput({
  context,
  className,
  editorProps = {},
  advanced,
  //callback functions
  onEnter,
  onChange,
  defaultValue = '',
}: IAutocompleteInputProps) {
  const [focused, setFocused] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string>(defaultValue);
  const monacoInstance: any = useMonaco();
  const [mounted, setMounted] = React.useState(false);
  const editorRef = React.useRef<any>();

  const monacoConfig = React.useMemo(() => {
    return getMonacoConfig(advanced);
  }, []);

  React.useEffect(() => {
    // inserting given object for autosuggestion
    setFocused(false);
    const disposable = showAutocompletion(monacoInstance, context);
    return disposable?.dispose;
  }, [monacoInstance, context]);

  React.useEffect(() => {
    if (focused) {
      editorRef.current?.focus();
    }
  }, [focused, mounted]);

  React.useEffect(() => {
    if (mounted) {
      monacoInstance.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      monacoInstance.editor.setTheme(monacoConfig.theme.name);
    }
  }, [mounted]);

  function handleDidMount(editor: any) {
    editorRef.current = editor;
    setMounted(true);
    editorRef.current.onDidFocusEditorWidget(() => {
      setFocused(true);
    });
    editorRef.current.onDidBlurEditorWidget(() => {
      setFocused(false);
    });
  }

  function handleChange(val: string | undefined, ev: any) {
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

  return (
    <div
      onClick={() => setFocused(true)}
      className={classNames(`AutocompleteInput ${className || ''}`, {
        AutocompleteInput__focused: focused,
        AutocompleteInput__advanced: advanced,
      })}
    >
      <Editor
        language='python'
        height={monacoConfig.height}
        value={value}
        onChange={handleChange}
        onMount={handleDidMount}
        loading={<span></span>}
        options={monacoConfig.options}
        {...editorProps}
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
