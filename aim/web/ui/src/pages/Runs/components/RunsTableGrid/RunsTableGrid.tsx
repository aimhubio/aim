import { merge } from 'lodash-es';

import { Badge } from 'components/kit';
import RunNameColumn from 'components/Table/RunNameColumn';
import GroupedColumnHeader from 'components/Table/GroupedColumnHeader';
import AttachedTagsList from 'components/AttachedTagsList/AttachedTagsList';

import COLORS from 'config/colors/colors';
import { TABLE_DEFAULT_CONFIG } from 'config/table/tableConfigs';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import { getMetricHash } from 'utils/app/getMetricHash';
import { getMetricLabel } from 'utils/app/getMetricLabel';
import { isSystemMetric } from 'utils/isSystemMetric';

function getRunsTableColumns(
  metricsColumns: any,
  runColumns: string[] = [],
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
): ITableColumn[] {
  let columns: ITableColumn[] = [
    {
      key: 'hash',
      content: <span>Hash</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('hash')
        ? 'left'
        : order?.middle?.includes('hash')
        ? null
        : order?.right?.includes('hash')
        ? 'right'
        : null,
    },
    {
      key: 'run',
      content: <span>Name</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('run')
        ? 'left'
        : order?.middle?.includes('run')
        ? null
        : order?.right?.includes('run')
        ? 'right'
        : 'left',
    },
    {
      key: 'experiment',
      content: <span>Experiment</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('experiment')
        ? 'left'
        : order?.middle?.includes('experiment')
        ? null
        : order?.right?.includes('experiment')
        ? 'right'
        : null,
    },
    {
      key: 'description',
      content: <span>Description</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('description')
        ? 'left'
        : order?.middle?.includes('description')
        ? null
        : order?.right?.includes('description')
        ? 'right'
        : null,
    },
    {
      key: 'date',
      content: <span>Date</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('date')
        ? 'left'
        : order?.middle?.includes('date')
        ? null
        : order?.right?.includes('date')
        ? 'right'
        : null,
    },
    {
      key: 'duration',
      content: <span>Duration</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('date')
        ? 'left'
        : order?.right?.includes('date')
        ? 'right'
        : null,
    },
    {
      key: 'tags',
      content: <span>Tags</span>,
      topHeader: 'Run',
      pin: order?.left?.includes('tags')
        ? 'left'
        : order?.right?.includes('tags')
        ? 'right'
        : null,
    },
  ].concat(
    Object.keys(metricsColumns).reduce((acc: any, metricName: string) => {
      const systemMetricsList: ITableColumn[] = [];
      const isSystem = isSystemMetric(metricName);
      const metricsList: ITableColumn[] = [];
      Object.keys(metricsColumns[metricName]).forEach((metricContext) => {
        const metricHash = getMetricHash(metricName, metricContext);
        const metricLabel = getMetricLabel(metricName, metricContext);

        let column = {
          key: metricHash,
          label: metricLabel,
          content: isSystem ? (
            <span>{formatSystemMetricName(metricName)}</span>
          ) : (
            <Badge
              monospace
              size='xSmall'
              color={COLORS[0][0]}
              label={metricContext === '' ? 'Empty context' : metricContext}
            />
          ),
          topHeader: isSystem ? 'System Metrics' : metricName,
          pin: order?.left?.includes(metricHash)
            ? 'left'
            : order?.right?.includes(metricHash)
            ? 'right'
            : null,
        };
        isSystem ? systemMetricsList.push(column) : metricsList.push(column);
      });
      acc = [
        ...acc,
        ...metricsList.sort(alphabeticalSortComparator({ orderBy: 'key' })),
        ...systemMetricsList.sort(
          alphabeticalSortComparator({ orderBy: 'key' }),
        ),
      ];
      return acc;
    }, []),
    runColumns.map((param) => ({
      key: param,
      content: <span>{param}</span>,
      topHeader: 'Run Params',
      pin: order?.left?.includes(param)
        ? 'left'
        : order?.right?.includes(param)
        ? 'right'
        : null,
    })),
  );

  columns = columns.map((col) => ({
    ...col,
    isHidden:
      !TABLE_DEFAULT_CONFIG.runs.nonHidableColumns.has(col.key) &&
      hiddenColumns.includes(col.key),
  }));

  const columnsOrder = order?.left.concat(order.middle).concat(order.right);
  columns.sort((a, b) => {
    if (!columnsOrder.includes(a.key) && !columnsOrder.includes(b.key)) {
      return 0;
    } else if (!columnsOrder.includes(a.key)) {
      return 1;
    } else if (!columnsOrder.includes(b.key)) {
      return -1;
    }
    return columnsOrder.indexOf(a.key) - columnsOrder.indexOf(b.key);
  });

  return columns;
}

function runsTableRowRenderer(
  rowData: any,
  groupHeaderRow = false,
  columns: string[] = [],
) {
  if (groupHeaderRow) {
    const row: { [key: string]: any } = {};
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (Array.isArray(rowData[col])) {
        row[col] = {
          content: <GroupedColumnHeader data={rowData[col]} />,
        };
      }
    }

    return merge({}, rowData, row);
  } else {
    console.log(rowData);
    const row = {
      experiment: rowData.experiment,
      run: {
        content: (
          <RunNameColumn
            run={rowData.run}
            runHash={rowData.hash}
            active={rowData.active}
          />
        ),
      },
      tags: {
        content: (
          <AttachedTagsList
            runHash={rowData.hash}
            initialTags={rowData.tags}
            headerRenderer={() => <></>}
            tableCellMode
          />
        ),
      },
      actions: {
        content: null,
      },
    };

    return merge({}, rowData, row);
  }
}

export { getRunsTableColumns, runsTableRowRenderer };
