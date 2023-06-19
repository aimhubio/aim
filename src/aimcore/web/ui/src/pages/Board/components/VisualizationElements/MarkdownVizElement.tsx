import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import { Box } from 'components/kit_v2';
import CodeBlock from 'components/CodeBlock/CodeBlock';

const markdownComponentsOverride = {
  code({ inline, children }: any) {
    if (inline) {
      return <pre style={{ display: 'inline-block' }}>{children[0]}</pre>;
    }

    return <CodeBlock code={children[0].trim()} />;
  },
};

function MarkdownVizElement(props: any) {
  return (
    <Box
      style={{ width: '100%' }}
      css={{
        color: '$textPrimary',
        fontFamily: '$inter',
        fontSize: '$3',
        fontWeight: '$2',
      }}
    >
      <ReactMarkdown components={markdownComponentsOverride}>
        {props.data}
      </ReactMarkdown>
    </Box>
  );
}

export default MarkdownVizElement;
