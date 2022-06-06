import React from 'react';
import * as monacoEditor from 'monaco-editor';

import Editor, { useMonaco } from '@monaco-editor/react';

import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';

import { ICodeBlockProps } from 'types/components/CodeBlock/CodeBlock';

import './CodeBlock.scss';

function CodeBlock({
  code = '',
  className = '',
  language = 'python',
}: ICodeBlockProps): React.FunctionComponentElement<React.ReactNode> {
  const [mounted, setMounted] = React.useState(true);
  const monaco: any = useMonaco();
  const contentRef = React.createRef<HTMLPreElement>();
  const editorRef = React.useRef<any>();

  const monacoConfig: Record<any, any> = React.useMemo(() => {
    return getMonacoConfig();
  }, []);

  React.useEffect(() => {
    monacoConfig.theme.config.colors = {
      ...monacoConfig.theme.config.colors,
      'editor.background': '#f2f3f4',
    };
    if (mounted && monaco) {
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      monaco.editor.setTheme(monacoConfig.theme.name);
    }
    // inserting given object for autosuggestion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco, mounted]);

  function handleDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    setMounted(true);
    // console.log(editorRef.current.getContentHeight());
    editorRef.current.layout({ height: editorRef.current.getContentHeight() });
  }

  return (
    <ErrorBoundary>
      <div className={`CodeBlock ${className}`}>
        <Editor
          language={language}
          value={code}
          onMount={handleDidMount}
          options={{
            ...monacoConfig.options,
            wordWrap: 'off',
            readOnly: true,
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden',
              handleMouseWheel: false,
            },
          }}
        />
        <ErrorBoundary>
          <CopyToClipBoard
            className='CodeBlock__copy__button'
            contentRef={contentRef}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(CodeBlock);
