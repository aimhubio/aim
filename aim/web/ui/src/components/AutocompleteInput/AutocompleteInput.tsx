import React from 'react';
import classNames from 'classnames';
import * as monacoEditor from 'monaco-editor';
import _ from 'lodash-es';

import Editor, { useMonaco } from '@monaco-editor/react';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './ AutocompleteInput';

import './AutocompleteInput.scss';

function AutocompleteInput({
  context,
  advanced,
  className,
  editorProps = {},
  value = '',
  refObject,
  disabled = false,
  //callback functions
  onEnter,
  onChange,
}: IAutocompleteInputProps) {
  const [hasSelection, setHasSelection] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [focused, setFocused] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [editorValue, setEditorValue] = React.useState<string>(value);
  const monaco: any = useMonaco();
  const editorRef = React.useRef<any>();

  React.useEffect(() => {
    initializeTheme();
    const onResize = _.debounce(() => {
      setContainerWidth(window.innerWidth);
    }, 500);
    window.addEventListener('resize', onResize);
    // inserting given object for autosuggestion
    handleBlur();
    const disposable = showAutocompletion(monaco, context);
    return () => {
      disposable?.dispose();
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco, context, mounted]);

  React.useEffect(() => {
    if (focused) {
      editorRef.current?.focus();
    }
  }, [focused, mounted]);

  React.useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  React.useEffect(() => {
    setTimeout(() => {
      initializeTheme();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  const monacoConfig: Record<any, any> = React.useMemo(() => {
    return getMonacoConfig(advanced);
  }, [advanced]);

  const handleFocus: () => void = React.useCallback((): void => {
    setFocused(true);
  }, []);

  const handleBlur: () => void = React.useCallback((): void => {
    setFocused(false);
  }, []);

  function handleDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor) {
    setMounted(true);
    editorRef.current = editor;
    if (refObject) {
      refObject.current = editorRef.current;
    }
    editorRef.current.onDidFocusEditorWidget(handleFocus);
    editorRef.current.onDidBlurEditorWidget(handleBlur);
    editorRef.current.onDidChangeCursorSelection(onSelectionChange);
  }

  function onSelectionChange(
    e: monacoEditor.editor.ICursorSelectionChangedEvent,
  ) {
    if (e.selection) {
      const { startColumn, endColumn } = e.selection;
      const selectionPosition = startColumn !== endColumn;
      setHasSelection(selectionPosition);
    }
  }

  const handleChange = React.useCallback(
    (
      val: string | undefined,
      ev: monacoEditor.editor.IModelContentChangedEvent,
    ) => {
      if (disabled) {
        editorRef.current!.setValue(editorValue);
        return;
      }
      if (typeof val === 'string') {
        // formatting value to avoid the new line
        let formattedValue = val.replace(/[\n\r]/g, '');
        if (ev.changes[0].text === '\n') {
          formattedValue = hasSelection
            ? editorValue.replace(/[\n\r]/g, '')
            : formattedValue;
          editorRef.current!.setValue(formattedValue);
          if (onEnter) {
            onEnter();
          }
          if (onChange) {
            onChange(formattedValue, ev);
          }
          setEditorValue(formattedValue);
          return;
        }
        setEditorValue(formattedValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasSelection, onChange, onEnter, disabled],
  );

  function initializeTheme(): void {
    if (mounted) {
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      monaco.editor.setTheme(monacoConfig.theme.name);
    }
  }

  return (
    <div
      onClick={handleFocus}
      className={classNames(`AutocompleteInput ${className || ''}`, {
        AutocompleteInput__focused: focused,
        AutocompleteInput__advanced: advanced,
        AutocompleteInput__disabled: disabled,
      })}
    >
      <Editor
        key={`${containerWidth}`}
        language='python'
        height={monacoConfig.height}
        value={editorValue}
        onChange={handleChange}
        onMount={handleDidMount}
        loading={<span />}
        options={monacoConfig.options}
        {...editorProps}
      />
      {mounted &&
        (focused || editorValue ? null : (
          <div className='AutocompleteInput__placeholder'>
            Filter runs, e.g. run.learning_rate {'>'} 0.0001 and run.batch_size
            == 32
          </div>
        ))}
    </div>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';

export default React.memo(AutocompleteInput);
