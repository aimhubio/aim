import React from 'react';
import classNames from 'classnames';

import Editor, { useMonaco, loader } from '@monaco-editor/react';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './ AutocompleteInput';

import './AutocompleteInput.scss';

// loading monaco from node modules instead of CDN
loader.config({
  paths: {
    vs: '/static-files/vs',
  },
});

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
  const [value, setValue] = React.useState<string>('');
  const monaco: any = useMonaco();
  const [mounted, setMounted] = React.useState(false);
  const editorRef = React.useRef<any>();

  const monacoConfig = React.useMemo(() => {
    return getMonacoConfig(advanced);
  }, [advanced]);

  React.useEffect(() => {
    // inserting given object for autosuggestion
    setFocused(false);
    const disposable = showAutocompletion(monaco, context);
    return disposable?.dispose;
  }, [monaco, context]);

  React.useEffect(() => {
    if (focused) {
      editorRef.current?.focus();
    }
  }, [focused, mounted]);

  React.useEffect(() => {
    if (mounted) {
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      setValue(defaultValue);
      monaco.editor.setTheme(monacoConfig.theme.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function handleDidMount(editor: any) {
    setMounted(true);
    editorRef.current = editor;
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
        loading={<span />}
        options={monacoConfig.options}
        {...editorProps}
      />
      {focused || value || defaultValue ? null : (
        <div className='AutocompleteInput__placeholder'>
          Filter runs, e.g. run.learning_rate {'>'} 0.0001 and run.batch_size ==
          32
        </div>
      )}
    </div>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';

export default React.memo(AutocompleteInput);
