import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';

import RunNameColumn from 'components/Table/RunNameColumn';
import { Badge } from 'components/kit';
import ExperimentNameBox from 'components/ExperimentNameBox';

import { TABLE_DATE_FORMAT } from 'config/dates/dates';

import { IResourceState } from 'modules/core/utils/createResource';

import { IRun } from 'types/services/models/metrics/runModel';

import contextToString from 'utils/contextToString';
import { processDurationTime } from 'utils/processDurationTime';
import { getMetricHash } from 'utils/app/getMetricHash';
import { formatValue } from 'utils/formatValue';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { decode, encode } from 'utils/encoder/encoder';

import createActiveRunsEngine from './ActiveRunsStore';

function useActiveRunsTable() {
  const tableRef = React.useRef<any>(null);
  const { current: activeRunsEngine } = React.useRef(createActiveRunsEngine);
  const activeRunsStore: IResourceState<IRun<unknown>[]> =
    activeRunsEngine.activeRunsState((state) => state);
  const [selectedRows, setSelectedRows] = React.useState<
    Record<string, boolean>
  >({});
  const [comparisonQuery, setComparisonQuery] = React.useState<string>('');

  React.useEffect(() => {
    activeRunsEngine.fetchActiveRuns();
    return () => {
      activeRunsEngine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metricsColumns = React.useMemo(() => {
    if (activeRunsStore.data) {
      const metrics: any = [];
      const systemMetrics: any = [];
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

            const isSystem = isSystemMetric(trace.name);
            const col = {
              key: metricHash,
              content: (
                <Badge
                  monospace
                  size='xSmall'
                  label={metricContext === '' ? 'Empty context' : metricContext}
                />
              ),
              topHeader: isSystem
                ? formatSystemMetricName(trace.name)
                : trace.name,
              name: trace.name,
              context: metricContext,
              isSystem,
            };

            if (isSystem) {
              systemMetrics.push(col);
            } else {
              metrics.push(col);
            }
          }
        });
      });

      return {
        columns: _.orderBy(metrics, ['name', 'context'], ['asc', 'asc']).concat(
          _.orderBy(systemMetrics, ['name', 'context'], ['asc', 'asc']),
        ) as any,
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
          const key = encode({
            hash,
          });
          let row: any = {
            key,
            selectKey: key,
            index,
            experiment: {
              content: (
                <ExperimentNameBox
                  experimentName={props.experiment?.name || ''}
                  experimentId={props.experiment?.id || ''}
                />
              ),
            },
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
                  : col.isSystem
                  ? formatValue(value)
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

  // Handler for row selection
  const onRowSelect = React.useCallback(
    ({ actionType, data }) => {
      let selected: Record<string, boolean> = { ...selectedRows };
      switch (actionType) {
        case 'single':
          if (selectedRows[data.key]) {
            selected = _.omit(selectedRows, data.key);
          } else {
            selected[data.key] = true;
          }
          break;
        case 'selectAll':
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              if (!selectedRows[item.key]) {
                selected[item.key] = true;
              }
            });
          } else {
            Object.values(data)
              .reduce((acc: any[], value: any) => {
                return acc.concat(value.items);
              }, [])
              .forEach((item: any) => {
                if (!selectedRows[item.selectKey]) {
                  selected[item.selectKey] = true;
                }
              });
          }
          break;
        case 'removeAll':
          if (Array.isArray(data)) {
            selected = {};
          }
          break;
      }

      setSelectedRows(selected);

      setComparisonQuery(
        `run.hash in [${Object.keys(selected)
          .map((key) => `"${JSON.parse(decode(key)).hash}"`)
          .join(', ')}]`,
      );
    },
    [selectedRows],
  );

  return {
    data: activeRunsStore.data,
    tableData,
    tableColumns,
    tableRef,
    loading: activeRunsStore.loading,
    selectedRows,
    comparisonQuery,
    onRowSelect,
  };
}

export default useActiveRunsTable;
