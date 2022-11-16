import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';

import { IResourceState } from 'modules/core/utils/createResource';

import { Badge } from 'components/kit';
import RunNameColumn from 'components/Table/RunNameColumn';

import { TABLE_DATE_FORMAT } from 'config/dates/dates';

import { IRun } from 'types/services/models/metrics/runModel';

import { getMetricHash } from 'utils/app/getMetricHash';
import contextToString from 'utils/contextToString';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { formatValue } from 'utils/formatValue';
import { processDurationTime } from 'utils/processDurationTime';
import { decode, encode } from 'utils/encoder/encoder';

import experimentRunsEngine from '../ExperimentRunsStore';

function useExperimentRunsTable(experimentName: string, experimentId: string) {
  const tableRef = React.useRef<any>(null);
  const [data, setData] = React.useState<any>([]);
  const [isInfiniteLoading, setIsInfiniteLoading] =
    React.useState<boolean>(false);
  const { current: engine } = React.useRef(experimentRunsEngine);
  const experimentRunsState: IResourceState<IRun<unknown>[]> =
    engine.experimentRunsState((state) => state);
  const [selectedRows, setSelectedRows] = React.useState<
    Record<string, boolean>
  >({});
  const [comparisonQuery, setComparisonQuery] = React.useState<string>('');

  React.useEffect(() => {
    if (_.isEmpty(experimentRunsState.data)) {
      engine.fetchExperimentRuns({
        limit: 50,
        exclude_params: true,
        q: `run.experiment == '${experimentName}'`,
      });
    }
    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (experimentRunsState.data) {
      engine.destroy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  React.useEffect(() => {
    if (experimentRunsState.data?.length) {
      let newData = [...data, ...experimentRunsState.data];
      setData(newData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentRunsState.data]);

  const metricsColumns = React.useMemo(() => {
    if (data) {
      const metrics: any = [];
      const systemMetrics: any = [];
      const metricsValues: any = {};
      data.forEach(({ hash, traces }: IRun<unknown>) => {
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
  }, [data]);

  // memoized table data
  const tableData = React.useMemo(() => {
    if (data) {
      return data.map(({ props, hash }: IRun<unknown>, index: number) => {
        const key = encode({
          hash,
        });
        let row: any = {
          key,
          selectKey: key,
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
                : col.isSystem
                ? formatValue(value)
                : `step: ${step} / value: ${formatValue(value)}`,
          };
        });
        return row;
      });
    }
    return [];
  }, [data, metricsColumns]);

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

  function loadMore(): void {
    if (experimentRunsState.data && !experimentRunsState.loading) {
      setIsInfiniteLoading(true);
      engine
        .fetchExperimentRuns({
          limit: 50,
          exclude_params: true,
          offset:
            experimentRunsState.data[experimentRunsState.data.length - 1].hash,
          q: `run.experiment == '${experimentName}'`,
        })
        .finally(() => setIsInfiniteLoading(false));
    }
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRows, tableData],
  );

  React.useEffect(() => {
    tableRef.current?.updateData({
      newData: tableData,
      newColumns: tableColumns,
    });
  }, [tableData, tableColumns]);

  return {
    data,
    tableData,
    tableColumns,
    tableRef,
    loading: experimentRunsState.loading,
    isInfiniteLoading,
    selectedRows,
    comparisonQuery,
    onRowSelect,
    loadMore,
  };
}

export default useExperimentRunsTable;
