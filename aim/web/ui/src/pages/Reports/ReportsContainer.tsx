import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';

import Editor from '@monaco-editor/react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Spinner } from 'components/kit';

import Board from 'pages/Board/Board';

import usePyodide from 'services/pyodide/usePyodide';

import './Reports.scss';

const markdownComponentsOverride = {
  code({ node, inline, className, children, ...props }: any) {
    if (inline) {
      return <pre style={{ display: 'inline-block' }}>{children[0]}</pre>;
    }
    const match = /language-(\w+)/.exec(className || '');

    if (match?.[1].startsWith('aim') && children?.[0]?.trim()) {
      let height: string | number = match[1].split('_')[1];
      if (height === undefined || height == '') {
        height = 450;
      } else {
        height = +height;
      }

      return (
        <div style={{ height, display: height === 0 ? 'none' : undefined }}>
          <Board
            key={children[0]}
            id={node.position.start.line}
            data={{ code: children[0] }}
            editMode={false}
            previewMode
          />
        </div>
      );
    }

    return <CodeBlock code={children[0].trim()} />;
  },
};

function ReportsContainer() {
  const { isLoading: pyodideIsLoading } = usePyodide();
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
              <div
                className={classNames('ReportVisualizer__main__components', {
                  'ReportVisualizer__main__components--loading':
                    pyodideIsLoading === null,
                  'ReportVisualizer__main__components--processing':
                    pyodideIsLoading,
                })}
              >
                {pyodideIsLoading !== false && (
                  <div className='ReportVisualizer__main__components__spinner'>
                    <Spinner />
                  </div>
                )}
                <div
                  key={`${pyodideIsLoading}`}
                  className='ReportVisualizer__main__components__viz'
                >
                  {!pyodideIsLoading && (
                    <ReactMarkdown components={markdownComponentsOverride}>
                      {value}
                    </ReactMarkdown>
                  )}
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
