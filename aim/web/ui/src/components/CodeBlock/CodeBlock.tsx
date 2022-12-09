import React from 'react';

import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useCodeHighlighter from 'hooks/useCodeHighlighter';

import { ICodeBlockProps } from 'types/components/CodeBlock/CodeBlock';

import './CodeBlock.scss';

function CodeBlock({
  code = '',
  className = '',
  language = 'python',
}: ICodeBlockProps): React.FunctionComponentElement<React.ReactNode> {
  const { elementRef } = useCodeHighlighter(language);

  return (
    <ErrorBoundary>
      <div className={`CodeBlock ${className} `}>
        <pre
          className='ScrollBar__hidden'
          data-lang={language}
          ref={elementRef}
        >
          {code}
        </pre>
        <ErrorBoundary>
          <CopyToClipBoard
            className='CodeBlock__copy__button'
            contentRef={elementRef}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(CodeBlock);
