import React from 'react';

import CodeBlock from 'components/CodeBlock/CodeBlock';

function CodeVizElement(props: any) {
  return <CodeBlock code={`${props.data}`} language={props.options.language} />;
}

export default CodeVizElement;
