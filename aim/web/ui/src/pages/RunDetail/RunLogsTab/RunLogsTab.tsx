import React from 'react';
import _ from 'lodash-es';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import { IRunLogsTabProps } from './RunLogsTab.d';

import './RunLogsTab.scss';

function RunLogsTab({ isRunLogsLoading, runHash, runLogs }: IRunLogsTabProps) {
  React.useEffect(() => {
    const runsBatchRequestRef = runDetailAppModel.getRunLogs(runHash, null);
    runsBatchRequestRef.call();
    // analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.params.tabView);

    return () => {
      runsBatchRequestRef.abort();
    };
  }, []);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunLogsLoading || _.isNil(runLogs)}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {!_.isEmpty(runLogs) ? (
          <div className='RunDetailLogsTabWrapper'>
            <div className='RunDetailLogsTab'>
              <div className='Logs'>
                {Object.values(runLogs).map((log, index) => {
                  return (
                    <p className='Logs__line' key={index}>
                      {log}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <IllustrationBlock
            size='xLarge'
            className='runDetailParamsTabLoader'
            title='No Logs'
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunLogsTab.displayName = 'RunLogsTab';

export default React.memo(RunLogsTab);
