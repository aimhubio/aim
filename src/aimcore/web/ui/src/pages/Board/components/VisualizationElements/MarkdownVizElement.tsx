import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import { Box } from 'components/kit_v2';
import CodeBlock from 'components/CodeBlock/CodeBlock';

import { styled } from 'config/stitches';

const MarkdownVizElementContainer = styled(Box, {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '$13',
  color: '$textPrimary',
  fontFamily: '$inter',
  fontSize: '$3',
  fontWeight: '$2',
  '& h3': {
    fontSize: '$6',
    fontWeight: '$2',
    color: '$textPrimary',
  },
  '& h2': {
    fontSize: '$9',
    fontWeight: '$2',
  },
});

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
    <MarkdownVizElementContainer>
      <ReactMarkdown components={markdownComponentsOverride}>
        {props.data}
      </ReactMarkdown>
    </MarkdownVizElementContainer>
  );
}

export default MarkdownVizElement;
