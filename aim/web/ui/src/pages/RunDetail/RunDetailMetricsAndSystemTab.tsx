import * as React from 'react';
import _ from 'lodash-es';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';
import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import { isSystemMetric } from 'utils/isSystemMetric';
import contextToString from 'utils/contextToString';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';

import RunMetricCard from './RunMetricCard';
import { IRunBatch, IRunDetailMetricsAndSystemTabProps } from './types';

function RunDetailMetricsAndSystemTab({
  runHash,
  runTraces,
  runBatch,
  isSystem,
  isRunBatchLoading,
}: IRunDetailMetricsAndSystemTabProps): React.FunctionComponentElement<React.ReactNode> {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const observerRef = React.useRef<IntersectionObserver>();
  const [observerIsReady, setObserverIsReady] = React.useState(false);
  const [visibleMetrics, setVisibleMetrics] = React.useState<
    IRunDetailMetricsAndSystemTabProps['runTraces']['metric']
  >([]);

  React.useEffect(() => {
    if (!!containerRef.current) {
      let options = {
        root: containerRef.current.parentElement?.parentElement,
        rootMargin: '0px',
        threshold: 0,
      };
      observerRef.current = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          let metrics: { name: string; context: string }[] = [];
          entries.forEach((entry: IntersectionObserverEntry) => {
            if (entry.isIntersecting) {
              let metricName = entry.target.getAttribute('data-name')!;
              let metricContext = entry.target.getAttribute('data-context')!;
              if (
                !runBatch?.find(
                  (batch: IRunBatch) =>
                    batch.name === metricName &&
                    contextToString(batch.context) === metricContext,
                )
              ) {
                metrics.push({
                  name: metricName,
                  context: metricContext,
                });
              }
            }
          });

          if (metrics.length > 0) {
            setVisibleMetrics((vM) =>
              vM.concat(
                metrics.map(
                  (metric) =>
                    runTraces.metric.find(
                      (m) =>
                        m.name === metric.name &&
                        contextToString(m.context) === metric.context,
                    )!,
                ),
              ),
            );
          }
        },
        options,
      );
      setObserverIsReady(true);
    }

    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs[isSystem ? 'system' : 'metrics']
        .tabView,
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isSystem, runBatch, observerIsReady, runTraces.metric]);

  React.useEffect(() => {
    let timerID: number;
    let runsBatchRequestRef: { call: () => Promise<void>; abort: () => void };
    if (visibleMetrics.length > 0) {
      timerID = window.setTimeout(() => {
        runsBatchRequestRef = runDetailAppModel.getRunMetricsBatch(
          visibleMetrics,
          runHash,
        );

        runsBatchRequestRef.call();
      }, 100);
    }

    return () => {
      if (timerID) {
        clearTimeout(timerID);
      }
      if (runsBatchRequestRef) {
        runsBatchRequestRef.abort();
      }
    };
  }, [visibleMetrics, runHash]);

  React.useEffect(() => {
    setVisibleMetrics((vM) =>
      vM.filter(
        (m) =>
          runBatch.findIndex(
            (batch: IRunBatch) =>
              batch.name === m.name &&
              contextToString(batch.context) === contextToString(m.context),
          ) === -1,
      ),
    );
  }, [runBatch]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunBatchLoading}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {!_.isEmpty(runTraces.metric) ? (
          <div className='RunDetailMetricsTab' ref={containerRef}>
            <div className='RunDetailMetricsTab__container'>
              {observerIsReady &&
                runTraces.metric
                  .filter((m) =>
                    isSystem ? isSystemMetric(m.name) : !isSystemMetric(m.name),
                  )
                  .map((m) => ({
                    ...m,
                    sortKey: `${m.name}_${contextToString(m.context)}`,
                  }))
                  .sort(alphabeticalSortComparator({ orderBy: 'sortKey' }))
                  .map((metric, i: number) => {
                    const batch: IRunBatch = {
                      ...metric,
                      ...runBatch?.find(
                        (batch: IRunBatch) =>
                          batch.name === metric.name &&
                          contextToString(batch.context) ===
                            contextToString(metric.context),
                      ),
                    };
                    return (
                      <RunMetricCard
                        key={`${batch.name}_${contextToString(batch.context)}`}
                        batch={batch}
                        index={i}
                        observer={observerRef.current}
                      />
                    );
                  })}
            </div>
          </div>
        ) : (
          <IllustrationBlock
            size='xLarge'
            className='runDetailParamsTabLoader'
            title={`No tracked ${isSystem ? 'system' : ''} metrics`}
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default React.memo(RunDetailMetricsAndSystemTab);
