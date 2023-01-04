import React from 'react';
import Split from 'react-split';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ILogsTabWrapperProps } from './LogsTabWrapper.d';

import './LogsTabWrapper.scss';

const RunLogsTab = React.lazy(
  () => import(/* webpackChunkName: "RunLogsTab" */ '../RunLogsTab'),
);

const RunLogRecords = React.lazy(
  () => import(/* webpackChunkName: "RunLogRecords" */ '../RunLogRecords'),
);

function LogsTabWrapper({
  isRunLogsLoading,
  runHash,
  runLogs,
  inProgress,
  updatedLogsCount,
}: ILogsTabWrapperProps) {
  return (
    <ErrorBoundary>
      <div className='LogsTabWrapper'>
        <div className='LogsTabWrapper__container'>
          <Split
            className='LogsTabWrapper__container__resizePanel'
            sizes={[65, 35]}
            minSize={300}
            expandToMin={false}
            gutterSize={10}
            gutterAlign='center'
            snapOffset={30}
            dragInterval={1}
            direction='horizontal'
            cursor='col-resize'
          >
            <div className='LogsTabWrapper__container__resizePanel__panelBox'>
              <RunLogsTab
                isRunLogsLoading={isRunLogsLoading}
                runHash={runHash}
                runLogs={runLogs}
                inProgress={inProgress}
                updatedLogsCount={updatedLogsCount}
              />
            </div>
            <div className='LogsTabWrapper__container__resizePanel__panelBox'>
              <RunLogRecords runHash={runHash} />
            </div>
          </Split>
        </div>
      </div>
    </ErrorBoundary>
  );
}

LogsTabWrapper.displayName = 'LogsTabWrapper';

export default React.memo(LogsTabWrapper);

// border: 0.0625rem solid rgb(222, 230, 243);
//     border-radius: 0.5rem;
//     display: flex;
