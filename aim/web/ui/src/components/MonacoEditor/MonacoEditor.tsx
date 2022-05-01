// eslint-disable-next-line import/order
import React from 'react';

import * as monaco from 'monaco-editor';
import classNames from 'classnames';

import Editor, { useMonaco, loader } from '@monaco-editor/react';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IMonacoEditorProps } from './MonacoEditor.d';

import './MonacoEditor.scss';

loader.config({ monaco });
function MonacoEditor({ context }: IMonacoEditorProps) {
  const monacoInstance: any = useMonaco();
  const editorRef = React.useRef<any>();
  const [focused, setFocused] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    const disposable = showAutocompletion(monacoInstance, context);
    return disposable?.dispose;
  }, [monacoInstance, context]);

  function handleChange(
    val: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent,
  ) {
    if (val) {
      let formatted = val.replace(/[\n\r]/g, '');
      if (ev.changes[0].text === '\n') {
        editorRef.current!.setValue(formatted);
      }
      setValue(formatted);
    }
  }

  function handleFocus() {
    setFocused(true);
  }
  function handleDidMount(editor: any) {
    // eslint-disable-next-line no-console

    editorRef.current = editor;
    editorRef.current.onDidFocusEditorWidget(() => {
      setFocused(true);
    });
    editorRef.current.onDidBlurEditorWidget(() => {
      setFocused(false);
    });
  }
  return (
    <div
      onFocus={handleFocus}
      className={classNames('MonacoEditor', {
        focused,
      })}
    >
      <Editor
        language='python'
        height='21px'
        value={value}
        onChange={handleChange}
        onMount={handleDidMount}
        options={{
          lineNumbers: 'off',
          minimap: { enabled: false },
          wordWrap: 'off',
          fontSize: 14,
          lineNumbersMinChars: 0,
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          lineDecorationsWidth: 0,
          hideCursorInOverviewRuler: true,
          contextmenu: false,
          glyphMargin: false,
          folding: false,
          scrollBeyondLastColumn: 0,
          renderLineHighlight: 'none',
          scrollbar: { horizontal: 'hidden', vertical: 'hidden' },
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: 'never',
            seedSearchStringFromSelection: 'never',
          },
        }}
      />
    </div>
  );
}

export default MonacoEditor;
