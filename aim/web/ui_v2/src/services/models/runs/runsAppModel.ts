import runsService from 'services/api/runs/runsService';
import createModel from '../model';
import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';
import { getRunsTableColumns } from 'pages/Runs/components/RunsTableColumns/RunsTableColumns';
import { IParam } from 'types/services/models/params/paramsAppModel';
import getObjectPaths from 'utils/getObjectPaths';
import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import _ from 'lodash-es';
import { encode, decode } from 'utils/encoder/encoder';
import { IMetric } from '../../../types/services/models/metrics/metricModel';
import {
  GroupNameType,
  IGetGroupingPersistIndex,
  IMetricAppConfig,
  IMetricsCollection,
  IMetricTableRowData,
} from '../../../types/services/models/metrics/metricsAppModel';
import {
  aggregateGroupData,
  AggregationAreaMethods,
  AggregationLineMethods,
} from '../../../utils/aggregateGroupData';
import { AlignmentOptions } from '../../../config/alignment/alignmentOptions';
import { INotification } from '../../../types/components/NotificationContainer/NotificationContainer';
import { HighlightEnum } from '../../../components/HighlightModesPopover/HighlightModesPopover';
import { CurveEnum, ScaleEnum } from '../../../utils/d3';
import { SmoothingAlgorithmEnum } from '../../../utils/smoothingData';
import { RowHeightSize } from '../../../config/table/tableConfigs';
import getStateFromUrl from '../../../utils/getStateFromUrl';
import React from 'react';
import getUrlWithParam from '../../../utils/getUrlWithParam';
import { setItem, getItem } from '../../../utils/storage';
import { ITableColumn } from '../../../types/pages/metrics/components/TableColumns/TableColumns';
import JsonToCSV from '../../../utils/JsonToCSV';
import { saveAs } from 'file-saver';
import moment from 'moment';

const model = createModel<Partial<any>>({
  requestIsPending: true,
  infiniteIsPending: false,
});

const initialPaginationConfig = {
  limit: 45,
  offset: null,
  isLatest: false,
};

function getConfig() {
  return {
    grouping: {
      color: [],
      stroke: [],
      chart: [],
      // TODO refactor boolean value types objects into one
      reverseMode: {
        color: false,
        stroke: false,
        chart: false,
      },
      isApplied: {
        color: true,
        stroke: true,
        chart: true,
      },
      persistence: {
        color: false,
        stroke: false,
      },
      seed: {
        color: 10,
        stroke: 10,
      },
      paletteIndex: 0,
    },
    chart: {
      highlightMode: HighlightEnum.Off,
      displayOutliers: true,
      zoomMode: false,
      axesScaleType: { xAxis: ScaleEnum.Linear, yAxis: ScaleEnum.Linear },
      curveInterpolation: CurveEnum.Linear,
      smoothingAlgorithm: SmoothingAlgorithmEnum.EMA,
      smoothingFactor: 0,
      alignmentConfig: {
        metric: '',
        type: AlignmentOptions.STEP,
      },
      aggregationConfig: {
        methods: {
          area: AggregationAreaMethods.MIN_MAX,
          line: AggregationLineMethods.MEAN,
        },
        isApplied: false,
        isEnabled: false,
      },
      tooltip: {
        content: {},
        display: true,
        selectedParams: [],
      },
      focusedState: {
        active: false,
        key: null,
        xValue: null,
        yValue: null,
        chartIndex: null,
      },
    },
    select: {
      metrics: [],
      query: '',
      advancedMode: false,
      advancedQuery: '',
    },
    // @TODO get from local storage
    table: {
      rowHeight: RowHeightSize.md,
      sortFields: [],
      hiddenMetrics: [],
      hiddenColumns: [],
      columnsOrder: {
        left: [],
        middle: [],
        right: [],
      },
    },
    pagination: initialPaginationConfig,
  };
}

function resetModelOnError(detail?: any) {
  const modelState = model.getState();
  model.setState({
    data: [],
    rowData: [],
    requestIsPending: false,
    infiniteIsPending: false,
    tableColumns: [],
    tableData: [],
    config: {
      ...modelState?.config,
      pagination: {
        ...initialPaginationConfig,
      },
    },
  });

  setTimeout(() => {
    const tableRef: any = model.getState()?.refs?.tableRef;
    tableRef.current?.updateData({
      newData: [],
      newColumns: [],
    });
  }, 0);
}

function exceptionHandler(detail: any) {
  let message = detail.message || 'Something went wrong';

  if (detail.name === 'SyntaxError') {
    message = `Query syntax error at line (${detail.line}, ${detail.offset})`;
  }

  onNotificationAdd({
    id: Date.now(),
    severity: 'error',
    message,
  });

  // reset model
  resetModelOnError(detail);
}

function prepareModelStateToCall(isInitial: boolean) {
  const config = model.getState()?.config;
  if (isInitial) {
    model.setState({
      config: {
        ...config,
        pagination: initialPaginationConfig,
      },
      notifyData: [],
      rowData: [],
      tableColumns: [],
      tableData: [],
      data: [],
    });
  }

  model.setState({
    requestIsPending: isInitial,
    infiniteIsPending: !isInitial,
  });

  return model.getState();
}

function getRunsData(isInitial = true) {
  // isInitial: true --> when search button clicked or data is loading at the first time
  const modelState = prepareModelStateToCall(isInitial);
  const configData = modelState?.config;

  const query = configData?.select?.query || '';
  const pagination = configData?.pagination;

  const { call, abort } = runsService.getRunsData(
    query,
    pagination?.limit,
    pagination?.offset,
  );

  return {
    call: async () => {
      try {
        const stream = await call(exceptionHandler);
        let gen = adjustable_reader(stream);
        let buffer_pairs = decode_buffer_pairs(gen);
        let decodedPairs = decodePathsVals(buffer_pairs);
        let objects = iterFoldTree(decodedPairs, 1);

        const runsData: IRun<IMetricTrace | IParamTrace>[] = isInitial
          ? []
          : modelState?.rowData;
        let count = 0;
        for await (let [keys, val] of objects) {
          if (isInitial) {
            const runData: any = val;
            runsData.push({ ...runData, hash: keys[0] } as any);
          } else {
            if (count > 0) {
              const runData: any = val;
              runsData.push({ ...runData, hash: keys[0] } as any);
            }
          }
          count++;
        }
        const { data, params } = processData(runsData);

        const tableData = getDataAsTableRows(data, null, params);
        const tableColumns = getRunsTableColumns(
          params,
          data[0]?.config,
          model.getState()?.config?.table.columnsOrder!,
        );

        model.setState({
          data,
          rowData: runsData,
          requestIsPending: false,
          infiniteIsPending: false,
          tableColumns,
          tableData,
          config: {
            ...modelState?.config,
            pagination: {
              ...modelState?.config.pagination,
              isLatest:
                !isInitial && count < modelState?.config.pagination.limit,
            },
          },
        });
        setTimeout(() => {
          const tableRef: any = model.getState()?.refs?.tableRef;
          tableRef.current?.updateData({
            newData: tableData,
            newColumns: tableColumns,
          });
        }, 0);
      } catch (e) {
        console.error(e);
      }
    },
    abort,
  };
}

function getLastRunsData(lastRow: any) {
  const modelData = model.getState();
  const infiniteIsPending = modelData?.infiniteIsPending;
  if (!infiniteIsPending) {
    model.setState({
      config: {
        ...modelData?.config,
        pagination: {
          ...modelData?.config.pagination,
          offset: lastRow.key,
        },
      },
    });
    return getRunsData(false);
  }
}

function setDefaultAppConfigData() {
  const grouping: IMetricAppConfig['grouping'] =
    getStateFromUrl('grouping') || getConfig().grouping;
  const chart: IMetricAppConfig['chart'] =
    getStateFromUrl('chart') || getConfig().chart;
  const select: IMetricAppConfig['select'] =
    getStateFromUrl('search') || getConfig().select;

  const tableConfigHash = getItem('runsTable');

  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;
  const configData: IMetricAppConfig = _.merge(getConfig(), {
    chart, // not useful
    grouping, // not useful
    select,
    table,
  });

  model.setState({
    config: configData,
  });
}

function initialize(appId: string = '') {
  model.init();
  model.setState({
    refs: {
      tableRef: { current: null },
      chartPanelRef: { current: null },
    },
    groupingSelectOptions: [],
  });
  if (!appId) {
    const searchParam = new URLSearchParams(window.location.search);
    const searchFromUrl = searchParam.get('search');
    const urlFromStorage = getItem('runsUrl');
    if (searchFromUrl) {
      setItem('runsUrl', getUrlWithParam('search', searchFromUrl));
    } else {
      if (urlFromStorage) {
        window.history.pushState(null, '', urlFromStorage);
      }
    }
  }
  setDefaultAppConfigData();

  return getRunsData();
}

function getFilteredRow(
  columnKeys: string[],
  row: IMetricTableRowData,
): { [key: string]: string } {
  return columnKeys.reduce((acc: { [key: string]: string }, column: string) => {
    let value = row[column];
    if (Array.isArray(value)) {
      value = value.join(', ');
    } else if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

    if (column.startsWith('params.')) {
      acc[column.replace('params.', '')] = value;
    } else {
      acc[column] = value;
    }

    return acc;
  }, {});
}

function onExportTableData(e: React.ChangeEvent<any>): void {
  const processedData = processData(
    model.getState()?.rowData as IRun<IMetricTrace>[],
  );

  const tableData: IMetricTableRowData[] = getDataAsTableRows(
    processedData.data,
    null,
    processedData.params,
  );
  const tableColumns: ITableColumn[] = getRunsTableColumns(
    processedData.params,
    processedData.data[0]?.config,
    model.getState()?.config?.table.columnsOrder!,
  );
  // TODO need to filter excludedFields and sort column order
  const excludedFields: string[] = [];
  const filteredHeader: string[] = tableColumns.reduce(
    (acc: string[], column: ITableColumn) =>
      acc.concat(excludedFields.indexOf(column.key) === -1 ? column.key : []),
    [],
  );
  // const flattenOrders = Object.keys(columnsOrder).reduce(
  //   (acc, key) => acc.concat(columnsOrder[key]),
  //   [],
  // );
  // filteredHeader.sort(
  //   (a, b) => flattenOrders.indexOf(a) - flattenOrders.indexOf(b),
  // );

  let emptyRow: { [key: string]: string } = {};
  filteredHeader.forEach((column: string) => {
    emptyRow[column] = '--';
  });

  const dataToExport = tableData?.reduce(
    (
      accArray: { [key: string]: string }[],
      rowData: IMetricTableRowData,
      rowDataIndex: number,
    ) => {
      if (rowData?.children?.length > 0) {
        rowData.children.forEach((row: IMetricTableRowData) => {
          const filteredRow = getFilteredRow(filteredHeader, row);
          accArray = accArray.concat(filteredRow);
        });
        if (tableData.length - 1 !== rowDataIndex) {
          accArray = accArray.concat(emptyRow);
        }
      } else {
        const filteredRow = getFilteredRow(filteredHeader, rowData);
        accArray = accArray.concat(filteredRow);
      }

      return accArray;
    },
    [],
  );

  const blob = new Blob([JsonToCSV(dataToExport)], {
    type: 'text/csv;charset=utf-8;',
  });
  saveAs(blob, `runs-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
}

function onNotificationDelete(id: number) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}

function onNotificationAdd(notification: INotification) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id);
  }, 3000);
}

function getFilteredGroupingOptions(
  grouping: IMetricAppConfig['grouping'],
  groupName: GroupNameType,
): string[] {
  const { reverseMode, isApplied } = grouping;
  const groupingSelectOptions = model.getState()?.groupingSelectOptions;
  if (groupingSelectOptions) {
    const filteredOptions = [...groupingSelectOptions]
      .filter((opt) => grouping[groupName].indexOf(opt.value) === -1)
      .map((item) => item.value);
    return isApplied[groupName]
      ? reverseMode[groupName]
        ? filteredOptions
        : grouping[groupName]
      : [];
  } else {
    return [];
  }
}

function getGroupingPersistIndex({
  groupValues,
  groupKey,
  grouping,
}: IGetGroupingPersistIndex) {
  const configHash = encode(groupValues[groupKey].config as {});
  let index = BigInt(0);
  for (let i = 0; i < configHash.length; i++) {
    const charCode = configHash.charCodeAt(i);
    if (charCode > 47 && charCode < 58) {
      index += BigInt(
        (charCode - 48) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
      );
    } else if (charCode > 96 && charCode < 103) {
      index += BigInt(
        (charCode - 87) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
      );
    }
  }
  return index;
}

function groupData(data: any): IMetricsCollection<IMetric>[] {
  const configData = model.getState()!.config;
  const grouping = configData!.grouping;
  const { paletteIndex } = grouping;
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStroke = getFilteredGroupingOptions(grouping, 'stroke');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
  if (
    groupByColor.length === 0 &&
    groupByStroke.length === 0 &&
    groupByChart.length === 0
  ) {
    return [
      {
        config: null,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data: data,
      },
    ];
  }
  const groupValues: {
    [key: string]: IMetricsCollection<IMetric>;
  } = {};

  const groupingFields = _.uniq(
    groupByColor.concat(groupByStroke).concat(groupByChart),
  );

  for (let i = 0; i < data.length; i++) {
    const groupValue: { [key: string]: string } = {};
    groupingFields.forEach((field) => {
      groupValue[field] = _.get(data[i], field);
    });
    const groupKey = encode(groupValue);
    if (groupValues.hasOwnProperty(groupKey)) {
      groupValues[groupKey].data.push(data[i]);
    } else {
      groupValues[groupKey] = {
        key: groupKey,
        config: groupValue,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data: [data[i]],
      };
    }
  }

  let colorIndex = 0;
  let dasharrayIndex = 0;
  let chartIndex = 0;

  const colorConfigsMap: { [key: string]: number } = {};
  const dasharrayConfigsMap: { [key: string]: number } = {};
  const chartIndexConfigsMap: { [key: string]: number } = {};

  for (let groupKey in groupValues) {
    const groupValue = groupValues[groupKey];

    if (groupByColor.length > 0) {
      const colorConfig = _.pick(groupValue.config, groupByColor);
      const colorKey = encode(colorConfig);

      if (grouping.persistence.color && grouping.isApplied.color) {
        let index = getGroupingPersistIndex({
          groupValues,
          groupKey,
          grouping,
        });
        groupValue.color =
          COLORS[paletteIndex][
            Number(index % BigInt(COLORS[paletteIndex].length))
          ];
      } else if (colorConfigsMap.hasOwnProperty(colorKey)) {
        groupValue.color =
          COLORS[paletteIndex][
            colorConfigsMap[colorKey] % COLORS[paletteIndex].length
          ];
      } else {
        colorConfigsMap[colorKey] = colorIndex;
        groupValue.color =
          COLORS[paletteIndex][colorIndex % COLORS[paletteIndex].length];
        colorIndex++;
      }
    }

    if (groupByStroke.length > 0) {
      const dasharrayConfig = _.pick(groupValue.config, groupByStroke);
      const dasharrayKey = encode(dasharrayConfig);
      if (grouping.persistence.stroke && grouping.isApplied.stroke) {
        let index = getGroupingPersistIndex({
          groupValues,
          groupKey,
          grouping,
        });
        groupValue.dasharray =
          DASH_ARRAYS[Number(index % BigInt(DASH_ARRAYS.length))];
      } else if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
        groupValue.dasharray =
          DASH_ARRAYS[dasharrayConfigsMap[dasharrayKey] % DASH_ARRAYS.length];
      } else {
        dasharrayConfigsMap[dasharrayKey] = dasharrayIndex;
        groupValue.dasharray = DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
        dasharrayIndex++;
      }
    }

    if (groupByChart.length > 0) {
      const chartIndexConfig = _.pick(groupValue.config, groupByChart);
      const chartIndexKey = encode(chartIndexConfig);
      if (chartIndexConfigsMap.hasOwnProperty(chartIndexKey)) {
        groupValue.chartIndex = chartIndexConfigsMap[chartIndexKey];
      } else {
        chartIndexConfigsMap[chartIndexKey] = chartIndex;
        groupValue.chartIndex = chartIndex;
        chartIndex++;
      }
    }
  }

  const groups = Object.values(groupValues);
  const chartConfig = configData!.chart;

  return aggregateGroupData({
    groupData: groups,
    methods: {
      area: chartConfig.aggregationConfig.methods.area,
      line: chartConfig.aggregationConfig.methods.line,
    },
    scale: chartConfig.axesScaleType,
  });
}

function processData(data: any[]): {
  data: any[];
  params: string[];
} {
  const configData = model.getState()?.config;
  const grouping = model.getState()?.config?.grouping;
  let runs: IParam[] = [];
  let params: string[] = [];
  const paletteIndex: number = grouping?.paletteIndex || 0;
  data.forEach((run: IRun<IParamTrace>, index) => {
    params = params.concat(getObjectPaths(run.params, run.params));

    runs.push({
      run,
      isHidden:
        configData!.table.hiddenMetrics![0] === 'all'
          ? true
          : configData!.table.hiddenMetrics!.includes(run.hash),
      color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      key: run.hash,
      dasharray: DASH_ARRAYS[0],
    });
  });
  const processedData = groupData(runs);
  const uniqParams = _.uniq(params);

  return {
    data: processedData,
    params: uniqParams,
  };
}

function getDataAsTableRows(
  processedData: any,
  xValue: number | string | null = null,
  paramKeys: string[],
): any {
  if (!processedData) {
    return [];
  }
  const rows: any = processedData[0]?.config !== null ? {} : [];
  let rowIndex = 0;

  processedData.forEach((metricsCollection: any) => {
    const groupKey = metricsCollection.key;
    const columnsValues: { [key: string]: string[] } = {};
    if (metricsCollection.config !== null) {
      const groupHeaderRow = {
        meta: {
          chartIndex: metricsCollection.chartIndex + 1,
        },
        key: groupKey!,
        color: metricsCollection.color,
        dasharray: metricsCollection.dasharray,
        experiment: '',
        run: '',
        metric: '',
        context: [],
        children: [],
      };
      rows[groupKey!] = {
        data: groupHeaderRow,
        items: [],
      };
    }
    metricsCollection.data.forEach((metric: any) => {
      const rowValues: any = {
        key: metric.key,
        index: rowIndex,
        color: metricsCollection.color ?? metric.color,
        dasharray: metricsCollection.dasharray ?? metric.dasharray,
        experiment: metric.run.props.experiment ?? 'default',
        run: metric.run.props.name ?? '-',
        metric: metric.metric_name,
      };
      rowIndex++;
      [
        'experiment',
        'run',
        'metric',
        'context',
        'step',
        'epoch',
        'time',
      ].forEach((key) => {
        if (columnsValues.hasOwnProperty(key)) {
          if (!_.some(columnsValues[key], rowValues[key])) {
            columnsValues[key].push(rowValues[key]);
          }
        } else {
          columnsValues[key] = [rowValues[key]];
        }
      });
      paramKeys.forEach((paramKey) => {
        const value = _.get(metric.run.params, paramKey, '-');
        rowValues[paramKey] = value;
        if (columnsValues.hasOwnProperty(paramKey)) {
          if (!columnsValues[paramKey].includes(value)) {
            columnsValues[paramKey].push(value);
          }
        } else {
          columnsValues[paramKey] = [value];
        }
      });
      if (metricsCollection.config !== null) {
        rows[groupKey!].items.push(rowValues);
      } else {
        rows.push(rowValues);
      }
    });
    if (metricsCollection.config !== null) {
      for (let columnKey in columnsValues) {
        rows[groupKey!].data[columnKey] =
          columnsValues[columnKey].length > 1
            ? 'Mix'
            : columnsValues[columnKey][0];
      }
    }
  });
  return rows;
}

function onSelectRunQueryChange(query: string) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: { ...configData.select, query },
      },
    });
  }
}

function setComponentRefs(refElement: React.MutableRefObject<any> | object) {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
  }
}

function updateUrlParam(
  paramName: string,
  data: Record<string, unknown>,
): void {
  const encodedUrl: string = encode(data);
  const url: string = getUrlWithParam(paramName, encodedUrl);
  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem('runsUrl', url);
  }
  window.history.pushState(null, '', url);
}

function updateSelectStateUrl(): void {
  const selectData = model.getState()?.config?.select;
  if (selectData) {
    updateUrlParam('search', selectData);
  }
}

function onColumnsOrderChange(columnsOrder: any) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      columnsOrder: columnsOrder,
    };
    const config = {
      ...configData,
      table,
    };

    model.setState({
      config,
    });
    setItem('runsTable', encode(table));
    updateModelData(config);
  }
}
function updateModelData(configData: IMetricAppConfig): void {
  const { data, params } = processData(
    model.getState()?.rowData as IRun<IMetricTrace>[],
  );
  const tableData = getDataAsTableRows(data, null, params);
  const tableColumns = getRunsTableColumns(
    params,
    data[0]?.config,
    configData.table.columnsOrder!,
  );
  const tableRef: any = model.getState()?.refs?.tableRef;
  tableRef.current?.updateData({
    newData: tableData,
    newColumns: tableColumns,
  });
  model.setState({
    config: configData,
    data,
    tableData,
    tableColumns,
  });
}

function onRowHeightChange(height: RowHeightSize) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      rowHeight: height,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('runsTable', encode(table));
  }
}

function onRunsVisibilityChange(metricsKeys: string[]) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      hiddenMetrics: metricsKeys,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('runsTable', encode(table));
    updateModelData(config);
  }
}

const runAppModel = {
  ...model,
  initialize,
  getRunsData,
  getLastRunsData,
  setComponentRefs,
  onExportTableData,
  onRowHeightChange,
  onNotificationDelete,
  onColumnsOrderChange,
  updateSelectStateUrl,
  onSelectRunQueryChange,
  onRunsVisibilityChange,
};

export default runAppModel;
