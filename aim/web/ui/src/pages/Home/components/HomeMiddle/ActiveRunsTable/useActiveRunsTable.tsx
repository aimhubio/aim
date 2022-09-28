import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';

import { IResourceState } from 'modules/core/utils/createResource';

import RunNameColumn from 'components/Table/RunNameColumn';
import { Badge } from 'components/kit';

import { TABLE_DATE_FORMAT } from 'config/dates/dates';

import { IRun } from 'types/services/models/metrics/runModel';

import { processDurationTime } from 'utils/processDurationTime';
import contextToString from 'utils/contextToString';
import { getMetricHash } from 'utils/app/getMetricHash';
import { formatValue } from 'utils/formatValue';

import createActiveRunsEngine from './ActiveRunsStore';

function useActiveRunsTable() {
  const tableRef = React.useRef<any>(null);
  const { current: activeRunsEngine } = React.useRef(createActiveRunsEngine);
  const activeRunsStore: IResourceState<IRun<unknown>[]> =
    activeRunsEngine.activeRunsState((state) => state);

  React.useEffect(() => {
    activeRunsEngine.fetchActiveRuns();
    return () => {
      activeRunsEngine.activeRunsState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metricsColumns = React.useMemo(() => {
    if (activeRunsStore.data) {
      const metrics: any = [];
      const metricsValues: any = {};
      activeRunsStore.data.forEach(({ hash, traces }: IRun<unknown>) => {
        traces.metric.forEach((trace: any) => {
          const metricHash = getMetricHash(trace.name, trace.context as any);

          if (metricsValues.hasOwnProperty(metricHash)) {
            metricsValues[metricHash][hash] = [
              trace.last_value.last_step,
              trace.last_value.last,
            ];
          } else {
            metricsValues[metricHash] = {
              [hash]: [trace.last_value.last_step, trace.last_value.last],
            };

            const metricContext = contextToString(
              trace.context as Record<string, unknown>,
            ) as string;

            metrics.push({
              key: metricHash,
              content: (
                <Badge
                  monospace
                  size='xSmall'
                  label={metricContext === '' ? 'Empty context' : metricContext}
                />
              ),
              topHeader: 'Run',
              name: trace.name,
              context: metricContext,
            });
          }
        });
      });

      return {
        columns: _.orderBy(metrics, ['name', 'context'], ['asc', 'asc']) as any,
        values: metricsValues,
      };
    }

    return {
      columns: [],
      values: [],
    };
  }, [activeRunsStore.data]);

  // memoized table data
  const tableData = React.useMemo(() => {
    if (activeRunsStore.data) {
      return activeRunsStore.data.map(
        ({ props, hash }: IRun<unknown>, index: number) => {
          let row: any = {
            key: index,
            index,
            experiment: props.experiment?.name,
            run: {
              content: (
                <RunNameColumn
                  run={props.name}
                  runHash={hash}
                  active={props.active}
                />
              ),
            },
            date: moment(props.creation_time * 1000).format(TABLE_DATE_FORMAT),
            duration: processDurationTime(
              props.creation_time * 1000,
              props.end_time ? props.end_time * 1000 : Date.now(),
            ),
          };

          metricsColumns.columns.forEach((col: any) => {
            const [step, value] = metricsColumns.values[col.key][hash] ?? [
              null,
              null,
            ];
            row[col.key] = {
              content:
                step === null
                  ? '--'
                  : `step: ${step} / value: ${formatValue(value)}`,
            };
          });
          return row;
        },
      );
    }
    return [];
  }, [activeRunsStore.data, metricsColumns]);

  // memoized table columns
  const tableColumns = React.useMemo(() => {
    const columns = [
      {
        key: 'experiment',
        content: <span>Experiment</span>,
        topHeader: 'Run',
        pin: 'left',
      },
      {
        key: 'run',
        content: <span>Name</span>,
        topHeader: 'Run',
        pin: 'left',
      },
      {
        key: 'date',
        content: <span>Date</span>,
        topHeader: 'Run',
      },
      {
        key: 'duration',
        content: <span>Duration</span>,
        topHeader: 'Run',
      },
    ];
    return columns.concat(metricsColumns.columns);
  }, [metricsColumns]);

  // Update the table data and columns when the activity data changes
  React.useEffect(() => {
    if (tableRef.current?.updateData) {
      tableRef.current.updateData({
        newColumns: tableColumns,
        newData: tableData,
      });
    }
  }, [tableData, tableColumns]);

  return {
    data: activeRunsStore.data,
    tableData,
    tableColumns,
    tableRef,
    loading: activeRunsStore.loading,
  };
}

export default useActiveRunsTable;
