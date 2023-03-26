import * as React from 'react';
import ReactMarkdown from 'react-markdown';

import Editor from '@monaco-editor/react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import CodeBlock from 'components/CodeBlock/CodeBlock';

import Board from 'pages/Board/Board';

import './Reports.scss';

const markdownComponentsOverride = {
  code({ node, inline, className, children, ...props }: any) {
    if (inline) {
      return <pre style={{ display: 'inline-block' }}>{children[0]}</pre>;
    }
    const match = /language-(\w+)/.exec(className || '');

    return match?.[1] === 'aim' && children ? (
      <div style={{ height: 450 }}>
        <Board
          key={children[0]}
          data={{ code: children[0] }}
          previewMode
          editMode={false}
        />
      </div>
    ) : (
      <CodeBlock code={children[0].trim()} />
    );
  },
};

function ReportsContainer() {
  let [value, setValue] = React.useState('');

  return (
    <ErrorBoundary>
      <section className='Reports'>
        <AppBar title='Reports' className='Reports__appBar' />
        <BusyLoaderWrapper isLoading={false} height={'100%'}>
          <div className='ReportVisualizer'>
            <div className='ReportVisualizer__main'>
              <div className='ReportVisualizer__main__editor'>
                <Editor
                  language='markdown'
                  height='100%'
                  value={value}
                  onChange={(v) => setValue(v!)}
                  loading={<span />}
                  options={{
                    tabSize: 4,
                    useTabStops: true,
                  }}
                />
              </div>
              <div className='ReportVisualizer__main__components'>
                <div className='ReportVisualizer__main__components__viz'>
                  <ReactMarkdown components={markdownComponentsOverride}>
                    {value}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </BusyLoaderWrapper>
      </section>
    </ErrorBoundary>
  );
}

export default ReportsContainer;
