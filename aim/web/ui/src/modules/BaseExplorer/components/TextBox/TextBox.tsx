import * as React from 'react';
import Editor from 'rich-markdown-editor';

import { Text } from 'components/kit';

import { TEXT_RENDERER_MODES } from 'pages/TextExplorer/textConfig';

import './TextBox.scss';

function TextBox(props: any) {
  const {
    engine,
    engine: { useStore },
    visualizationName,
    data,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const textRenderer = useStore(controls.textRenderer.stateSelector);

  const text = data.data.data;

  const content: Record<string, JSX.Element> = {
    [TEXT_RENDERER_MODES.TEXT]: (
      <Text color={props.data.style.color} style={{ whiteSpace: 'normal' }}>
        {text}
      </Text>
    ),
    [TEXT_RENDERER_MODES.MARKDOWN]: (
      <Editor
        ref={null}
        value={text}
        readOnly
        className='TextBox__Markdown'
        disableExtensions={['table', 'image', 'container_notice']}
      />
    ),
    [TEXT_RENDERER_MODES.HTML]: (
      <div dangerouslySetInnerHTML={{ __html: text }} />
    ),
    [TEXT_RENDERER_MODES.CODE]: (
      <Text component='pre' color={props.data.style.color}>
        {text}
      </Text>
    ),
  };

  return (
    <div className='TextBox' style={{ color: props.data.style.color }}>
      {content[textRenderer.type]}
    </div>
  );
}

export default React.memo(TextBox);
