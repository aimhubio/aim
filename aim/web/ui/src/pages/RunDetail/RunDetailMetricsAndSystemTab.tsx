import * as React from 'react';
import _ from 'lodash-es';
import { useModel } from 'hooks';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Text } from 'components/kit';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

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

  const tabMertcis = React.useMemo(
    () =>
      runTraces.metric.filter((m) =>
        isSystem ? isSystemMetric(m.name) : !isSystemMetric(m.name),
      ),
    [runTraces.metric, isSystem],
  );
  let pinnedMetrics: IRunDetailMetricsAndSystemTabProps['runTraces']['metric'] =
    [];
  let regularMetrics: IRunDetailMetricsAndSystemTabProps['runTraces']['metric'] =
    [];

  for (let i = 0; i < tabMertcis.length; i++) {
    let metric = tabMertcis[i];
    let pinnedSequenceIndex =
      projectsData?.pinnedSequences?.findIndex(
        (seq) =>
          seq.name === metric.name &&
          contextToString(seq.context) === contextToString(metric.context),
      ) ?? -1;
    if (pinnedSequenceIndex > -1) {
      pinnedMetrics[pinnedSequenceIndex] = metric;
    } else {
      regularMetrics.push(metric);
    }
  }

  pinnedMetrics.filter((metric) => !!metric);

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
  }, [isSystem, runBatch, observerIsReady, runTraces.metric, tabMertcis]);

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

  async function togglePin(metric: IPinnedSequence, isPinned: boolean) {
    const newPinnedMetrics = isPinned
      ? pinnedMetrics.filter(
          (m) =>
            !(
              m.name === metric.name &&
              contextToString(m.context) === contextToString(metric.context)
            ),
        )
      : [...pinnedMetrics, metric];
    const setPinnedSequencesRequestRef = projectsModel.setPinnedSequences(
      {
        sequences: newPinnedMetrics,
      },
      (detail: unknown) => {
        projectsModel.setState({
          pinnedSequences: pinnedMetrics,
        });
        exceptionHandler({ detail, model: runDetailAppModel });
      },
    );

    projectsModel.setState({
      pinnedSequences: newPinnedMetrics,
    });

    setPinnedSequencesRequestRef.call();
  }

  function renderMetricCards(
    metrics: IRunDetailMetricsAndSystemTabProps['runTraces']['metric'],
    pinned: boolean,
  ) {
    return (
      observerIsReady &&
      metrics.length > 0 && (
        <>
          <div className='RunDetailMetricsTab__header'>
            <Text component='h3' size={16} color='primary'>
              {pinned ? 'Pinned ' : ''}Metrics
            </Text>
          </div>
          <div className='RunDetailMetricsTab__container'>
            {(pinned
              ? metrics
              : metrics
                  .map((m) => ({
                    ...m,
                    sortKey: `${m.name}_${contextToString(m.context)}`,
                  }))
                  .sort(alphabeticalSortComparator({ orderBy: 'sortKey' }))
            ).map((metric, i: number) => {
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
        </>
      )
    );
  }

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunBatchLoading}
        className='RunDetailTabLoader'
        height='100%'
      >
        {!_.isEmpty(tabMertcis) ? (
          <div className='RunDetailMetricsTab' ref={containerRef}>
            {renderMetricCards(pinnedMetrics, true)}
            {renderMetricCards(regularMetrics, false)}
          </div>
        ) : (
          <IllustrationBlock
            size='xLarge'
            className='RunDetailTabLoader'
            title={`No tracked ${isSystem ? 'system' : ''} metrics`}
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default React.memo(RunDetailMetricsAndSystemTab);
