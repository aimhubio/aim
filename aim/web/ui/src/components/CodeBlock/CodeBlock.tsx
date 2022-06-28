import React from 'react';

import { useMonaco } from '@monaco-editor/react';

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
  const monaco = useMonaco();
  const preRef = React.useRef<HTMLPreElement>(null);

  const monacoConfig: Record<string | number | symbol, any> =
    React.useMemo(() => {
      return getMonacoConfig();
    }, []);

  React.useEffect(() => {
    monacoConfig.theme.config.colors = {
      ...monacoConfig.theme.config.colors,
      'editor.background': '#f2f3f4',
    };
    if (monaco && preRef.current) {
      monaco.editor.colorizeElement(preRef.current, { theme: language });
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      monaco.editor.setTheme(monacoConfig.theme.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco]);

  return (
    <ErrorBoundary>
      <div className={`CodeBlock ${className} `}>
        <pre className='ScrollBar__hidden' data-lang={language} ref={preRef}>
          {code}
        </pre>
        <ErrorBoundary>
          <CopyToClipBoard
            className='CodeBlock__copy__button'
            contentRef={preRef}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(CodeBlock);
