import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import useRunMetricsBatch from '../hooks/useRunMetricsBatch';

import GitInfoCard from './components/GitInfoCard';
import RunOverviewTabMetricsCard from './components/MetricsCard/RunOverviewTabMetricsCard';
import RunOverviewTabPackagesCard from './components/Packages/RunOverviewTabPackagesCard';
import RunOverviewTabParamsCard from './components/ParamsCard/RunOverviewTabParamsCard';
import RunOverviewSidebar from './components/RunOverviewSidebar/RunOverviewSidebar';
import RunOverviewTabCLIArgumentsCard from './components/CLIArgumentsCard/RunOverviewTabCLIArgumentsCard';
import RunOverviewTabEnvVariablesCard from './components/EnvVariablesCard/RunOverviewTabEnvVariablesCard';
import { IRunOverviewTabProps } from './RunOverviewTab.d';

import './RunOverviewTab.scss';

function RunOverviewTab({ runData, runHash }: IRunOverviewTabProps) {
  const sidebarRef = React.useRef<HTMLElement | any>(null);
  const overviewSectionRef = React.useRef<HTMLElement | any>(null);
  const overviewSectionContentRef = React.useRef<HTMLElement | any>(null);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);

  useRunMetricsBatch({
    runTraces: runData.runTraces,
    runHash,
  });

  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs['overview'].tabView,
    );
  }, []);

  const cardsData: Record<any, any> = React.useMemo(() => {
    const data: any = {};
    const systemParams = runData?.runParams?.__system_params;
    if (!_.isEmpty(runData?.runParams)) {
      data.runParams = runData.runParams;
    }
    if (!_.isEmpty(runData?.runMetricsBatch)) {
      data.runMetricsBatch = runData.runMetricsBatch;
    }
    if (!_.isEmpty(runData?.runSystemBatch)) {
      data.runSystemBatch = runData.runSystemBatch;
    }
    if (systemParams) {
      if (!_.isEmpty(systemParams.arguments)) {
        data.cliArguments = systemParams.arguments;
      }
      if (!_.isEmpty(systemParams.env_variables)) {
        data.envVariables = systemParams.env_variables;
      }
      if (!_.isEmpty(systemParams.packages)) {
        data.packages = systemParams.packages;
      }
      if (!_.isEmpty(systemParams.packages)) {
        data.gitInfo = systemParams.git_info;
      }
    }
    return data;
  }, [runData]);

  function onContainerScroll(e: any) {
    sidebarRef?.current?.scrollTo(0, e.target.scrollTop);
  }

  return (
    <ErrorBoundary>
      <section
        className='RunOverviewTab'
        ref={overviewSectionRef}
        onScroll={onContainerScroll}
      >
        <div
          className='RunOverviewTab__content'
          ref={overviewSectionContentRef}
          style={{ height: containerHeight }}
        >
          {_.isEmpty(cardsData) ? (
            <IllustrationBlock size='large' title='No Results' />
          ) : (
            <>
              {_.isEmpty(cardsData?.runParams) ? null : (
                <ErrorBoundary>
                  <RunOverviewTabParamsCard
                    runParams={cardsData?.runParams}
                    isRunInfoLoading={runData?.isRunInfoLoading}
                  />
                </ErrorBoundary>
              )}
              {_.isEmpty(cardsData?.runMetricsBatch) ? null : (
                <ErrorBoundary>
                  <RunOverviewTabMetricsCard
                    isLoading={runData?.isRunBatchLoading}
                    type='metric'
                    runBatch={cardsData?.runMetricsBatch}
                  />
                </ErrorBoundary>
              )}

              {_.isEmpty(cardsData?.runSystemBatch) ? null : (
                <ErrorBoundary>
                  <RunOverviewTabMetricsCard
                    isLoading={runData?.isRunBatchLoading}
                    type='systemMetric'
                    runBatch={cardsData?.runSystemBatch}
                  />
                </ErrorBoundary>
              )}
              {_.isEmpty(cardsData.cliArguments) ? null : (
                <ErrorBoundary>
                  <RunOverviewTabCLIArgumentsCard
                    cliArguments={cardsData.cliArguments}
                    isRunInfoLoading={runData?.isRunInfoLoading}
                  />
                </ErrorBoundary>
              )}
              {_.isEmpty(cardsData.envVariables) ? null : (
                <ErrorBoundary>
                  <RunOverviewTabEnvVariablesCard
                    envVariables={cardsData.envVariables}
                    isRunInfoLoading={runData?.isRunInfoLoading}
                  />
                </ErrorBoundary>
              )}
              {_.isEmpty(cardsData.packages) ? null : (
                <ErrorBoundary>
                  <RunOverviewTabPackagesCard
                    packages={cardsData.packages}
                    isRunInfoLoading={runData?.isRunInfoLoading}
                  />
                </ErrorBoundary>
              )}
              {_.isEmpty(cardsData.gitInfo) ? null : (
                <ErrorBoundary>
                  <GitInfoCard data={cardsData.gitInfo} />
                </ErrorBoundary>
              )}
            </>
          )}
        </div>
        <ErrorBoundary>
          <RunOverviewSidebar
            sidebarRef={sidebarRef}
            overviewSectionRef={overviewSectionRef}
            overviewSectionContentRef={overviewSectionContentRef}
            setContainerHeight={setContainerHeight}
            runHash={runHash}
            info={runData.runInfo}
            traces={runData.runTraces}
          />
        </ErrorBoundary>
      </section>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
