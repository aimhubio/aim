import React from 'react';
import classNames from 'classnames';

import Editor, { useMonaco, loader } from '@monaco-editor/react';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';
import { getBasePath } from 'config/config';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './ AutocompleteInput';

import './AutocompleteInput.scss';

// loading monaco from node modules instead of CDN
loader.config({
  paths: {
    vs: `${getBasePath()}/static-files/vs`,
  },
});

function AutocompleteInput({
  context,
  advanced,
  className,
  editorProps = {},
  value = '',
  //callback functions
  onEnter,
  onChange,
}: IAutocompleteInputProps) {
  const [editorValue, setEditorValue] = React.useState<string>('');
  const [hasSelection, setHasSelection] = React.useState(false);
  const [focused, setFocused] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const monaco: any = useMonaco();
  const editorRef = React.useRef<any>();

  React.useEffect(() => {
    if (mounted) {
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      setEditorValue(value);
      monaco.editor.setTheme(monacoConfig.theme.name);
    }
    // inserting given object for autosuggestion
    handleBlur();
    const disposable = showAutocompletion(monaco, context);
    return () => {
      disposable?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco, context, mounted]);

  React.useEffect(() => {
    if (focused) {
      editorRef.current?.focus();
    }
  }, [focused, mounted]);

  const monacoConfig: Record<any, any> = React.useMemo(() => {
    return getMonacoConfig(advanced);
  }, [advanced]);

  const handleFocus: () => void = React.useCallback((): void => {
    setFocused(true);
  }, []);

  const handleBlur: () => void = React.useCallback((): void => {
    setFocused(false);
  }, []);

  function handleDidMount(editor: any) {
    setMounted(true);
    editorRef.current = editor;
    editorRef.current.onDidFocusEditorWidget(handleFocus);
    editorRef.current.onDidBlurEditorWidget(handleBlur);
    editorRef.current.onDidChangeCursorSelection(onSelectionChange);
  }

  function onSelectionChange(e: any) {
    if (e.selection) {
      const { startColumn, endColumn } = e.selection;
      const selectionPosition = startColumn !== endColumn;
      setHasSelection(selectionPosition);
    }
  }

  const handleChange = React.useCallback(
    (val: string | undefined, ev: any) => {
      if (typeof val === 'string') {
        // formatting value to avoid the new line
        let formatted = (hasSelection ? editorValue : val).replace(
          /[\n\r]/g,
          '',
        );
        if (ev.changes[0].text === '\n') {
          editorRef.current!.setValue(formatted);
          if (onEnter) {
            onEnter();
          }
        }
        setEditorValue(formatted);
        if (onChange) {
          onChange(formatted, ev);
        }
      }
    },
    [hasSelection, editorValue, onChange, onEnter],
  );

  return (
    <div
      onClick={handleFocus}
      className={classNames(`AutocompleteInput ${className || ''}`, {
        AutocompleteInput__focused: focused,
        AutocompleteInput__advanced: advanced,
      })}
    >
      <Editor
        language='python'
        height={monacoConfig.height}
        value={editorValue}
        onChange={handleChange}
        onMount={handleDidMount}
        loading={<span />}
        options={monacoConfig.options}
        {...editorProps}
      />
      {focused || editorValue || value ? null : (
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
