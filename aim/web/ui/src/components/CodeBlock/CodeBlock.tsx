import React from 'react';

import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useCodeHighlighter from 'hooks/useCodeHighlighter';

import { ICodeBlockProps } from 'types/components/CodeBlock/CodeBlock';

import {
  CodeBlockContainer,
  CodeBlockPre,
  CopyToClipboardButton,
} from './CodeBlock.style';

function CodeBlock({
  code = '',
  className = '',
  language = 'python',
  hideCopyIcon = false,
}: ICodeBlockProps): React.FunctionComponentElement<React.ReactNode> {
  const { elementRef } = useCodeHighlighter(language);

  return (
    <ErrorBoundary>
      <CodeBlockContainer className={`CodeBlock ${className} `}>
        <CodeBlockPre
          as='pre'
          className='ScrollBar__hidden'
          data-lang={language}
          ref={elementRef}
        >
          {code}
        </CodeBlockPre>
        <ErrorBoundary>
          {hideCopyIcon ? null : (
            <CopyToClipboardButton>
              <CopyToClipBoard contentRef={elementRef} />
            </CopyToClipboardButton>
          )}
        </ErrorBoundary>
      </CodeBlockContainer>
    </ErrorBoundary>
  );
}

export default React.memo(CodeBlock);
