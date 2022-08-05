import * as React from 'react';
import _ from 'lodash-es';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useModel from 'hooks/model/useModel';

import * as analytics from 'services/analytics';
import runDetailAppModel from 'services/models/runs/runDetailAppModel';
import projectsModel from 'services/models/projects/projectsModel';

import {
  IPinnedSequence,
  IProjectsModelState,
} from 'types/services/models/projects/projectsModel';

import { isSystemMetric } from 'utils/isSystemMetric';
import contextToString from 'utils/contextToString';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import exceptionHandler from 'utils/app/exceptionHandler';

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
  const projectsData = useModel<Partial<IProjectsModelState>>(
    projectsModel,
    false,
  );

  const tabMertcis = runTraces.metric.filter((m) =>
    isSystem ? isSystemMetric(m.name) : !isSystemMetric(m.name),
  );
  let pinnedMetrics: IRunDetailMetricsAndSystemTabProps['runTraces']['metric'] =
    [];
  let regularMetrics: IRunDetailMetricsAndSystemTabProps['runTraces']['metric'] =
    [];

  for (let i = 0; i < tabMertcis.length; i++) {
    let metric = tabMertcis[i];
    if (
      projectsData?.pinnedSequences &&
      projectsData?.pinnedSequences?.findIndex(
        (seq) =>
          seq.name === metric.name &&
          contextToString(seq.context) === contextToString(metric.context),
      ) > -1
    ) {
      pinnedMetrics.push(metric);
    } else {
      regularMetrics.push(metric);
    }
  }

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
                    tabMertcis.find(
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

  function togglePin(metric: IPinnedSequence, isPinned: boolean) {
    const newPinnedMetrics = isPinned
      ? pinnedMetrics.filter(
          (m) =>
            !(
              m.name === metric.name &&
              contextToString(m.context) === contextToString(metric.context)
            ),
        )
      : [...pinnedMetrics, metric];
    const setPinnedSequencesRequestRef = projectsModel.setPinnedSequences({
      sequences: newPinnedMetrics,
    });

    projectsModel.setState({
      pinnedMetrics: newPinnedMetrics,
    });

    try {
      setPinnedSequencesRequestRef.call();
    } catch (ex: unknown) {
      console.log(ex);
      projectsModel.setState({
        pinnedMetrics,
      });
      exceptionHandler({ detail: ex, model: projectsModel });
    }
  }

  function renderMetricCards(
    metrics: IRunDetailMetricsAndSystemTabProps['runTraces']['metric'],
    pinned: boolean,
  ) {
    return (
      metrics.length > 0 && (
        <div className='RunDetailMetricsTab__container'>
          {observerIsReady &&
            metrics
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
                    isPinned={pinned}
                    togglePin={togglePin}
                  />
                );
              })}
        </div>
      )
    );
  }

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunBatchLoading}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {!_.isEmpty(tabMertcis) ? (
          <div className='RunDetailMetricsTab' ref={containerRef}>
            {renderMetricCards(pinnedMetrics, true)}
            {pinnedMetrics.length > 0 && regularMetrics.length > 0 && <hr />}
            {renderMetricCards(regularMetrics, false)}
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
