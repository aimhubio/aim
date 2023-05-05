import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import classNames from 'classnames';

import Editor from '@monaco-editor/react';
import { IconPencil } from '@tabler/icons-react';

import { Spinner } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import SplitPane, { SplitPaneItem } from 'components/SplitPane';
import ResizingFallback from 'components/ResizingFallback';
import RouteLeavingGuard from 'components/RouteLeavingGuard';
import { Box, Button, Link } from 'components/kit_v2';
import Breadcrumb from 'components/kit_v2/Breadcrumb';

import { PathEnum } from 'config/enums/routesEnum';
import { TopBar } from 'config/stitches/foundations/layout';

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
      if (height === undefined || height === '') {
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
          <TopBar className='Report__appBar'>
            <Box flex='1 100%'>
              <Breadcrumb
                customRouteValues={{
                  [`/reports/${reportId}`]: data.name,
                }}
              />
            </Box>
            {editMode || newMode ? (
              <div className='Report__appBar__controls'>
                <SaveReport
                  saveReport={saveReport}
                  getEditorValue={() => value}
                  initialState={data}
                />
                <Link
                  css={{ display: 'flex' }}
                  to={PathEnum.Report.replace(
                    ':reportId',
                    newMode ? '' : reportId,
                  )}
                  underline={false}
                >
                  <Button variant='outlined' size='xs'>
                    Cancel
                  </Button>
                </Link>
              </div>
            ) : (
              <Link
                css={{ display: 'flex' }}
                to={PathEnum.Report_Edit.replace(':reportId', reportId)}
                underline={false}
              >
                <Button variant='outlined' size='xs' rightIcon={<IconPencil />}>
                  Edit
                </Button>
              </Link>
            )}
          </TopBar>
        )}
        <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
          <div className='ReportVisualizer'>
            <SplitPane
              id='ReportVisualizer'
              useLocalStorage={true}
              className='ReportVisualizer__main'
              sizes={editMode || newMode ? [40, 60] : [100, 0]}
              minSize={[400, 400]}
            >
              {editMode || newMode ? (
                <SplitPaneItem className='ReportVisualizer__main__editor'>
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
                </SplitPaneItem>
              ) : null}
              <SplitPaneItem
                resizingFallback={<ResizingFallback />}
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
              </SplitPaneItem>
            </SplitPane>
          </div>
        </BusyLoaderWrapper>
      </section>
      {(editMode || newMode) && (
        <RouteLeavingGuard when={value !== data.code} />
      )}
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </ErrorBoundary>
  );
}

Report.displayName = 'Report';
export default Report;
