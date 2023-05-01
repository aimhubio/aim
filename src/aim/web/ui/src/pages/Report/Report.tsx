import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';
import { Link as RouteLink } from 'react-router-dom';

import { Link } from '@material-ui/core';
import Editor from '@monaco-editor/react';

import { Button, Icon, Spinner } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';

import { PathEnum } from 'config/enums/routesEnum';

import Board from 'pages/Board/Board';

import usePyodide from 'services/pyodide/usePyodide';

import SaveReport from './components/SaveReport';

import './Report.scss';

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
            data={{ code: children[0], id: node.position.start.line }}
            editMode={false}
            previewMode
          />
        </div>
      );
    }

    return <CodeBlock code={children[0].trim()} />;
  },
};

function Report({
  data,
  isLoading,
  editMode,
  newMode,
  previewMode,
  notifyData,
  onNotificationDelete,
  saveReport,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const reportId = data.id;

  const { isLoading: pyodideIsLoading } = usePyodide();
  let [value, setValue] = React.useState(data.code);

  return (
    <ErrorBoundary>
      <section className='Report'>
        {!previewMode && (
          <AppBar title={data.name} className='Report__appBar'>
            {editMode || newMode ? (
              <div className='Report__appBar__controls'>
                <SaveReport
                  saveReport={saveReport}
                  getEditorValue={() => value}
                  initialState={data}
                />
                <Link
                  to={PathEnum.Report.replace(
                    ':reportId',
                    newMode ? '' : reportId,
                  )}
                  component={RouteLink}
                  underline='none'
                >
                  <Button variant='outlined' size='small'>
                    Cancel
                  </Button>
                </Link>
              </div>
            ) : (
              <Link
                to={PathEnum.Report_Edit.replace(':reportId', reportId)}
                component={RouteLink}
                underline='none'
              >
                <Button variant='outlined' size='small'>
                  Edit{' '}
                  <Icon name='edit' style={{ marginLeft: 5 }} fontSize={12} />
                </Button>
              </Link>
            )}
          </AppBar>
        )}
        <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
          <div className='ReportVisualizer'>
            <div className='ReportVisualizer__main'>
              {(editMode || newMode) && (
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
              )}
              <div
                className={classNames('ReportVisualizer__main__components', {
                  'ReportVisualizer__main__components--loading':
                    pyodideIsLoading === null,
                  'ReportVisualizer__main__components--processing':
                    pyodideIsLoading,
                  'ReportVisualizer__main__components--fullWidth':
                    !editMode || !newMode,
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
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </ErrorBoundary>
  );
}

export default Report;
