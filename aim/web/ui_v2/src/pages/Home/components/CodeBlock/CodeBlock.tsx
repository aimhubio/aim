import React from 'react';
import copyIcon from 'assets/icons/copy.svg';

import './CodeBlock.scss';

function CodeBlock({
  rowList,
  className = '',
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={`CodeBlock__container ${className}`}>
      <code>
        {rowList.map((row: string, index: number) => (
          <pre key={index}>{row}</pre>
        ))}
      </code>
      <span className='CodeBlock__copy__span'>
        <img src={copyIcon} alt='copy' />
      </span>
    </div>
  );
}

export default React.memo(CodeBlock);
