import React from 'react';

import Editor, { useMonaco, loader } from '@monaco-editor/react';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IMonacoEditorProps } from './MonacoEditor.d';
function MonacoEditor({ context }: IMonacoEditorProps) {
  const monaco: any = useMonaco();
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    const disposable = showAutocompletion(monaco, context);
    return disposable?.dispose;
  }, [monaco, context]);

  return (
    <Editor
      language='python'
      height='32px'
      onChange={(value: any) => setValue(value.replace(/[\n\r]/g, ''))}
      value={value}
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
      // value={
      //   'def something(params):\n\t# type params. to see suggestions\n\tprint("hey")'
      // }
    />
  );
}

export default MonacoEditor;
