import React from 'react';
import copyIcon from 'assets/icons/copy.svg';
// import AssignmentTurnedInOutlinedIcon from '@material-ui/icons/AssignmentTurnedInOutlined';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwlLight';

import './CodeBlock.scss';
import { ICodeBlockProps } from 'types/components/CodeBlock/CodeBlock';
import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';

function CodeBlock({
  code = '',
  className = '',
  language = 'python',
}: ICodeBlockProps): React.FunctionComponentElement<React.ReactNode> {
  const contentRef = React.createRef<HTMLPreElement>();
  const [copied, setCopied] = React.useState<boolean>(false);

  function handleCodeCopy(): void {
    setCopied(true);
    navigator.clipboard.writeText(code);
  }
  return (
    <div className={`CodeBlock__container ${className}`}>
      <Highlight
        {...defaultProps}
        theme={theme}
        code={code.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style} ref={contentRef}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <CopyToClipBoard
        className='CodeBlock__copy__span'
        contentRef={contentRef}
      />
    </div>
  );
}

export default React.memo(CodeBlock);
