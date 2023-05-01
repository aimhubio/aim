import React from 'react';
import classNames from 'classnames';
import * as monacoEditor from 'monaco-editor';
import _ from 'lodash-es';

import Editor, { useMonaco } from '@monaco-editor/react';

import { Icon, Text } from 'components/kit';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';
import { DOCUMENTATIONS } from 'config/references';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './AutocompleteInput.d';

import './AutocompleteInput.scss';

function AutocompleteInput({
  context,
  advanced,
  className,
  editorProps = {},
  value = '',
  refObject,
  error,
  disabled = false,
  forceRemoveError = false,
  //callback functions
  onEnter,
  onChange,
}: IAutocompleteInputProps) {
  const [hasSelection, setHasSelection] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const [focused, setFocused] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [editorValue, setEditorValue] = React.useState<string>(value);
  const [errorMessage, setErrorMessage] = React.useState('');
  const monaco: any = useMonaco();
  const editorRef = React.useRef<any>();

  React.useEffect(() => {
    initializeTheme();
    if (mounted) {
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      monaco.editor.setTheme(monacoConfig.theme.name);
    }
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
    setTimeout(() => {
      initializeTheme();
      setMarkers();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth]);

  React.useEffect(() => {
    setMarkers();
    if (forceRemoveError && !error) {
      setErrorMessage('');
      deleteMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, monaco, forceRemoveError]);

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

  function setMarkers(): void {
    if (monaco && error) {
      setErrorMessage(error?.message);
      monaco.editor.setModelMarkers(monaco.editor.getModels()[0], 'marker', [
        {
          startLineNumber: error?.detail.line,
          startColumn: error?.detail.offset,
          endLineNumber: error?.detail.line,
          endColumn: error?.detail?.end_offset || error?.detail.offset,
          message: error?.message,
          severity: monaco.MarkerSeverity.Error,
        },
      ]);
    }
  }

  function deleteMarkers() {
    if (monaco?.editor) {
      monaco.editor.setModelMarkers(monaco.editor.getModels()[0], 'marker', []);
    }
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
      deleteMarkers();
      setErrorMessage('');
      if (typeof val === 'string') {
        // formatting value to avoid the new line
        let formattedValue = val.replace(/[\n\r]/g, '');
        if (
          ev.changes[0].text.startsWith('[') &&
          formattedValue[ev.changes[0].rangeOffset - 1] === '.'
        ) {
          formattedValue =
            formattedValue.slice(0, ev.changes[0].rangeOffset - 1) +
            formattedValue.slice(
              ev.changes[0].rangeOffset,
              formattedValue.length,
            );
        }
        //@TODO: check why the onCHange function have been called in the  if (ev.changes[0].text === '\n') { scope
        if (onChange) {
          // formattedValue = hasSelection
          //   ? editorValue.replace(/[\n\r]/g, '')
          //   : formattedValue;
          onChange(formattedValue, ev);
        }
        if (ev.changes[0].text === '\n') {
          formattedValue = hasSelection
            ? editorValue.replace(/[\n\r]/g, '')
            : formattedValue;
          editorRef.current!.setValue(formattedValue);
          if (onEnter) {
            onEnter();
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
    <section
      className={classNames(`AutocompleteInput ${className || ''}`, {
        AutocompleteInput__disabled: disabled,
      })}
    >
      <div
        onClick={handleFocus}
        className={classNames('AutocompleteInput__container', {
          AutocompleteInput__container__focused: focused,
          AutocompleteInput__container__advanced: advanced,
          AutocompleteInput__container__error: errorMessage,
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
            <div className='AutocompleteInput__container__placeholder'>
              Filter runs, e.g. run.learning_rate {'>'} 0.0001 and
              run.batch_size == 32
            </div>
          ))}
      </div>
      {errorMessage && (
        <div className='AutocompleteInput__errorBar'>
          <div>
            <Text
              color='error'
              className='AutocompleteInput__errorBar__message'
              component='p'
              size={16}
            >
              <Text size={16} color='error' weight={700}>
                Error:
              </Text>
              {errorMessage}
            </Text>
          </div>
          <div className='AutocompleteInput__errorBar__hint'>
            <Icon name='info-circle-outline' box />
            <Text>
              Aim Query Language is pythonic and fairly easy to get used to. If
              you are having issues, please refer to the{' '}
              <a href={DOCUMENTATIONS.AIM_QL} target='_blank' rel='noreferrer'>
                docs
              </a>{' '}
              for detailed usage guide and more examples.
            </Text>
          </div>
        </div>
      )}
    </section>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';

export default React.memo(AutocompleteInput);
