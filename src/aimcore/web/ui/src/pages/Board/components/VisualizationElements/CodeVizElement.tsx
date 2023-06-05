import React from 'react';

import { Box } from 'components/kit_v2';
import CodeBlock from 'components/CodeBlock/CodeBlock';

function CodeVizElement(props: any) {
  return (
    <Box>
      <CodeBlock code={`${props.data}`} language={props.options.language} />
    </Box>
  );
}

export default CodeVizElement;
