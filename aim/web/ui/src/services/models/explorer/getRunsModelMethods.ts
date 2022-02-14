import moment from 'moment';
import { saveAs } from 'file-saver';
import _ from 'lodash-es';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { RowHeightSize } from 'config/table/tableConfigs';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import {
  getRunsTableColumns,
  runsTableRowRenderer,
} from 'pages/Runs/components/RunsTableGrid/RunsTableGrid';

import * as analytics from 'services/analytics';
import runsService from 'services/api/runs/runsService';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { IMetric } from 'types/services/models/metrics/metricModel';
import {
  IMetricsCollection,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsAppModel';
import {
  IMetricTrace,
  IParamTrace,
  IRun,
} from 'types/services/models/metrics/runModel';
import { IParam } from 'types/services/models/params/paramsAppModel';
import { IRunsAppModelState } from 'types/services/models/runs/runsAppModel';
import {
  IAppModelConfig,
  IAppModelState,
} from 'types/services/models/explorer/createAppModel';

import { aggregateGroupData } from 'utils/aggregateGroupData';
import exceptionHandler from 'utils/app/exceptionHandler';
import { getFilteredGroupingOptions } from 'utils/app/getFilteredGroupingOptions';
import getFilteredRow from 'utils/app/getFilteredRow';
import { getGroupingPersistIndex } from 'utils/app/getGroupingPersistIndex';
import onColumnsOrderChange from 'utils/app/onColumnsOrderChange';
import onColumnsVisibilityChange from 'utils/app/onColumnsVisibilityChange';
import onRowHeightChange from 'utils/app/onRowHeightChange';
import onSelectRunQueryChange from 'utils/app/onSelectRunQueryChange';
import { onTableDiffShow } from 'utils/app/onTableDiffShow';
import updateColumnsWidths from 'utils/app/updateColumnsWidths';
import updateSortFields from 'utils/app/updateTableSortFields';
import contextToString from 'utils/contextToString';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { formatValue } from 'utils/formatValue';
import getObjectPaths from 'utils/getObjectPaths';
import JsonToCSV from 'utils/JsonToCSV';
import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';
import onNotificationDelete from 'utils/app/onNotificationDelete';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import updateURL from 'utils/app/updateURL';
import { isSystemMetric } from 'utils/isSystemMetric';
import { getValue } from 'utils/helper';
import onRowSelect from 'utils/app/onRowSelect';

export default function getRunsModelMethods({
  appName,
  model,
  grouping,
  components,
  selectForm,
  setModelDefaultAppConfigData,
}: any) {
  let runsRequestRef: {
    call: (
      exceptionHandler: (detail: any) => void,
    ) => Promise<ReadableStream<IRun<IParamTrace>[]>>;
    abort: () => void;
  };
  let runsArchiveRef: {
    call: (exceptionHandler: (detail: any) => void) => Promise<any>;
    abort: () => void;
  };
  let runsDeleteRef: {
    call: (exceptionHandler: (detail: any) => void) => Promise<any>;
    abort: () => void;
  };
  let liveUpdateInstance: LiveUpdateService | null;
  let updateTableTimeoutId: number;

  function initialize(appId: string = '') {
    model.init();
    const state: Partial<IAppModelState> = {};
    if (grouping) {
      state.groupingSelectOptions = [];
    }
    if (components?.table) {
      state.refs = {
        ...state.refs,
        tableRef: { current: null },
      };
    }
    if (components?.charts?.[0]) {
      // tooltipData = {};
      state.refs = {
        ...state.refs,
        chartPanelRef: { current: null },
      };
    }
    model.setState({ ...state });
    if (!appId) {
      setModelDefaultAppConfigData();
    }

    const liveUpdateState = model.getState()?.config.liveUpdate;

    if (liveUpdateState?.enabled) {
      liveUpdateInstance = new LiveUpdateService(
        appName,
        updateData,
        liveUpdateState.delay,
      );
    }
    try {
      getRunsData().call((detail) => {
        exceptionHandler({ detail, model });
      });
    } catch (err: any) {
      onNotificationAdd({
        model,
        notification: {
          id: Date.now(),
          message: err.message,
          severity: 'error',
        },
      });
    }
  }

  function abortRequest(): void {
    if (runsRequestRef) {
      runsRequestRef.abort();
    }

    model.setState({
      requestIsPending: false,
    });

    onModelNotificationAdd({
      id: Date.now(),
      severity: 'info',
      message: 'Request has been cancelled',
    });
  }

  function getRunsData(
    shouldUrlUpdate?: boolean,
    shouldResetSelectedRows?: boolean,
    isInitial = true,
  ): {
    call: (exceptionHandler: (detail: any) => void) => Promise<any>;
    abort: () => void;
  } {
    if (runsRequestRef) {
      runsRequestRef.abort();
    }
    // isInitial: true --> when search button clicked or data is loading at the first time
    const modelState = prepareModelStateToCall(isInitial);
    const configData = modelState?.config;

    const query = configData?.select?.query || '';
    const pagination = configData?.pagination;

    liveUpdateInstance?.stop().then();

    runsRequestRef = runsService.getRunsData(
      query,
      pagination?.limit,
      pagination?.offset,
    );

    if (shouldUrlUpdate) {
      updateURL({ configData, appName });
    }

    return {
      call: async () => {
        try {
          const stream = await runsRequestRef.call((detail) => {
            exceptionHandler({ detail, model });
          });
          let gen = adjustable_reader(stream as ReadableStream<any>);
          let buffer_pairs = decode_buffer_pairs(gen);
          let decodedPairs = decodePathsVals(buffer_pairs);
          let objects = iterFoldTree(decodedPairs, 1);

          const runsData: IRun<IMetricTrace | IParamTrace>[] = isInitial
            ? []
            : modelState?.rawData;
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
          const { data, params, metricsColumns, selectedRows } =
            processData(runsData);

          const tableData = getDataAsTableRows(data, metricsColumns, params);
          const tableColumns = getRunsTableColumns(
            metricsColumns,
            params,
            model.getState()?.config?.table.columnsOrder!,
            model.getState()?.config?.table.hiddenColumns!,
          );
          updateTableData(tableData, tableColumns, configData);
          model.setState({
            data,
            selectedRows: shouldResetSelectedRows
              ? {}
              : selectedRows ?? model.getState()?.selectedRows,
            rawData: runsData,
            requestIsPending: false,
            infiniteIsPending: false,
            tableColumns,
            tableData: tableData.rows,
            sameValueColumns: tableData.sameValueColumns,
            config: {
              ...modelState?.config,
              pagination: {
                ...modelState?.config.pagination,
                isLatest:
                  !isInitial && count < modelState?.config.pagination.limit,
              },
            },
          });
        } catch (ex: Error | any) {
          if (ex.name === 'AbortError') {
            onNotificationAdd({
              notification: {
                id: Date.now(),
                severity: 'error',
                message: `${ex.name}, ${ex.message}`,
              },
              model,
            });
          }
        }
        liveUpdateInstance?.start({
          q: query,
          limit: pagination.limit + model.getState()?.rawData?.length || 0,
        });
      },
      abort: runsRequestRef.abort,
    };
  }

  function updateModelData(
    configData = model.getState()!.config!,
    shouldURLUpdate?: boolean,
  ): void {
    const { data, params, metricsColumns, selectedRows } = processData(
      model.getState()?.rawData as IRun<IMetricTrace>[],
    );
    const tableData = getDataAsTableRows(data, metricsColumns, params);
    const tableColumns: ITableColumn[] = getRunsTableColumns(
      metricsColumns,
      params,
      configData?.table?.columnsOrder!,
      configData?.table?.hiddenColumns!,
    );
    updateTableData(tableData, tableColumns, configData);
    model.setState({
      config: configData,
      data,
      tableData: tableData.rows,
      tableColumns,
      sameValueColumns: tableData.sameValueColumns,
      selectedRows,
    });
  }

  function updateTableData(
    tableData: {
      rows: any;
      sameValueColumns: string[];
    },
    tableColumns: ITableColumn[],
    configData: IAppModelConfig | any,
  ): void {
    if (updateTableTimeoutId) {
      clearTimeout(updateTableTimeoutId);
    }

    updateTableTimeoutId = window.setTimeout(() => {
      const tableRef: any = model.getState()?.refs?.tableRef;
      tableRef.current?.updateData({
        newData: tableData.rows,
        newColumns: tableColumns,
        hiddenColumns: configData.table.hiddenColumns!,
      });
    }, 0);
  }

  function prepareModelStateToCall(isInitial: boolean): IRunsAppModelState {
    const config = model.getState()?.config;
    if (isInitial) {
      model.setState({
        config: {
          ...config,
          pagination: {
            limit: 45,
            offset: null,
            isLatest: false,
          },
        },
        notifyData: [],
        rawData: [],
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

  function processData(data: any[]): {
    data: any[];
    params: string[];
    metricsColumns: any;
    selectedRows: any;
  } {
    const grouping = model.getState()?.config?.grouping;
    let selectedRows = model.getState()?.selectedRows;
    let runs: IParam[] = [];
    let params: string[] = [];
    const paletteIndex: number = grouping?.paletteIndex || 0;
    const metricsColumns: any = {};

    data?.forEach((run: IRun<IParamTrace>, index) => {
      params = params.concat(getObjectPaths(run.params, run.params));
      run.traces.metric.forEach((trace) => {
        metricsColumns[trace.name] = {
          ...metricsColumns[trace.name],
          [contextToString(trace.context) as string]: '-',
        };
      });
      runs.push({
        run,
        isHidden: false,
        color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
        key: run.hash,
        dasharray: DASH_ARRAYS[0],
      });
    });
    const processedData = groupData(runs);
    const uniqParams = _.uniq(params);
    const mappedData =
      data?.reduce((acc: any, item: any) => {
        acc[item.hash] = { runHash: item.hash, ...item.props };
        return acc;
      }, {}) || {};
    if (selectedRows && !_.isEmpty(selectedRows)) {
      selectedRows = Object.keys(selectedRows).reduce(
        (acc: any, key: string) => {
          const slicedKey = key.slice(0, key.indexOf('/'));
          acc[key] = {
            selectKey: key,
            ...mappedData[slicedKey],
          };
          return acc;
        },
        {},
      );
    }
    return {
      data: processedData,
      params: uniqParams,
      metricsColumns,
      selectedRows,
    };
  }

  function groupData(data: any): IMetricsCollection<IMetric>[] {
    const configData = model.getState()!.config;
    const grouping = configData!.grouping;

    const groupByColor = getFilteredGroupingOptions({
      groupName: 'color',
      model,
    });
    const groupByStroke = getFilteredGroupingOptions({
      groupName: 'stroke',
      model,
    });
    const groupByChart = getFilteredGroupingOptions({
      groupName: 'chart',
      model,
    });
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
        groupValue[field] = getValue(data[i], field);
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
    const { paletteIndex = 0 } = grouping || {};

    for (let groupKey in groupValues) {
      const groupValue = groupValues[groupKey];

      if (groupByColor.length > 0) {
        const colorConfig = _.pick(groupValue.config, groupByColor);
        const colorKey = encode(colorConfig);

        if (grouping.persistence.color && grouping.isApplied.color) {
          let index = getGroupingPersistIndex({
            groupConfig: colorConfig,
            grouping,
            groupName: 'color',
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
            groupConfig: dasharrayConfig,
            grouping,
            groupName: 'stroke',
          });
          groupValue.dasharray =
            DASH_ARRAYS[Number(index % BigInt(DASH_ARRAYS.length))];
        } else if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
          groupValue.dasharray =
            DASH_ARRAYS[dasharrayConfigsMap[dasharrayKey] % DASH_ARRAYS.length];
        } else {
          dasharrayConfigsMap[dasharrayKey] = dasharrayIndex;
          groupValue.dasharray =
            DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
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

  function getDataAsTableRows(
    processedData: any,
    metricsColumns: any,
    paramKeys: string[],
    isRawData?: boolean,
  ): { rows: IMetricTableRowData[] | any; sameValueColumns: string[] } {
    if (!processedData) {
      return {
        rows: [],
        sameValueColumns: [],
      };
    }
    const initialMetricsRowData = Object.keys(metricsColumns).reduce(
      (acc: any, key: string) => {
        const groupByMetricName: any = {};
        Object.keys(metricsColumns[key]).forEach((metricContext: string) => {
          groupByMetricName[
            `${isSystemMetric(key) ? key : `${key}_${metricContext}`}`
          ] = '-';
        });
        acc = { ...acc, ...groupByMetricName };
        return acc;
      },
      {},
    );
    const rows: any = processedData[0]?.config !== null ? {} : [];
    let rowIndex = 0;
    const sameValueColumns: string[] = [];

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
        const metricsRowValues = { ...initialMetricsRowData };
        metric.run.traces.metric.forEach((trace: any) => {
          metricsRowValues[
            `${
              isSystemMetric(trace.name)
                ? trace.name
                : `${trace.name}_${contextToString(trace.context)}`
            }`
          ] = formatValue(trace.last_value.last);
        });
        const rowValues: any = {
          key: metric.key,
          selectKey: `${metric.run.hash}/${metric.key}`,
          runHash: metric.run.hash,
          index: rowIndex,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.dasharray,
          experiment: metric.run.props.experiment?.name ?? 'default',
          run: moment(metric.run.props.creation_time * 1000).format(
            'HH:mm:ss · D MMM, YY',
          ),
          metric: metric.name,
          ...metricsRowValues,
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
          const value = getValue(metric.run.params, paramKey, '-');
          rowValues[paramKey] = formatValue(value);
          if (columnsValues.hasOwnProperty(paramKey)) {
            if (!columnsValues[paramKey].includes(value)) {
              columnsValues[paramKey].push(value);
            }
          } else {
            columnsValues[paramKey] = [value];
          }
        });
        if (metricsCollection.config !== null) {
          rows[groupKey!].items.push(
            isRawData ? rowValues : runsTableRowRenderer(rowValues),
          );
        } else {
          rows.push(isRawData ? rowValues : runsTableRowRenderer(rowValues));
        }
      });

      for (let columnKey in columnsValues) {
        if (columnsValues[columnKey].length === 1) {
          sameValueColumns.push(columnKey);
        }

        if (metricsCollection.config !== null) {
          rows[groupKey!].data[columnKey] =
            columnsValues[columnKey].length === 1
              ? columnsValues[columnKey][0]
              : columnsValues[columnKey];
        }

        if (metricsCollection.config !== null && !isRawData) {
          rows[groupKey!].data = runsTableRowRenderer(
            rows[groupKey!].data,
            true,
            Object.keys(columnsValues),
          );
        }
      }
    });

    return { rows, sameValueColumns };
  }

  function onModelNotificationAdd<N>(notification: N & INotification): void {
    onNotificationAdd({ notification, model });
  }

  function getLastRunsData(
    lastRow: any,
  ):
    | { call: (exception: any) => Promise<void>; abort: () => void }
    | undefined {
    const modelData: Partial<IRunsAppModelState> = model.getState();
    const infiniteIsPending = modelData?.infiniteIsPending;
    const isLatest = modelData?.config.pagination.isLatest;

    if (!infiniteIsPending && !isLatest) {
      const lastRowKey = modelData?.rawData[modelData?.rawData.length - 1].hash;
      model.setState({
        config: {
          ...modelData?.config,
          pagination: {
            ...modelData?.config.pagination,
            offset: lastRowKey,
          },
        },
      });
      return getRunsData(false, false, false);
    }
  }

  function onExportTableData(): void {
    // @TODO need to get data and params from state not from processData
    const { data, params, metricsColumns } = processData(
      model.getState()?.rawData as IRun<IMetricTrace>[],
    );
    const tableData = getDataAsTableRows(data, metricsColumns, params, true);
    const configData = model.getState()?.config;
    const tableColumns: ITableColumn[] = getRunsTableColumns(
      metricsColumns,
      params,
      configData?.table.columnsOrder!,
      configData?.table.hiddenColumns!,
    );
    const excludedFields: string[] = ['#', 'actions'];
    const filteredHeader: string[] = tableColumns.reduce(
      (acc: string[], column: ITableColumn) =>
        acc.concat(
          excludedFields.indexOf(column.key) === -1 && !column.isHidden
            ? column.key
            : [],
        ),
      [],
    );

    let emptyRow: { [key: string]: string } = {};
    filteredHeader.forEach((column: string) => {
      emptyRow[column] = '--';
    });

    const groupedRows: IMetricTableRowData[][] =
      data.length > 1
        ? Object.keys(tableData.rows).map(
            (groupedRowKey: string) => tableData.rows[groupedRowKey].items,
          )
        : [tableData.rows];

    const dataToExport: { [key: string]: string }[] = [];

    groupedRows.forEach(
      (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
        groupedRow?.forEach((row: IMetricTableRowData) => {
          const filteredRow = getFilteredRow({
            columnKeys: filteredHeader,
            row,
          });
          dataToExport.push(filteredRow);
        });
        if (groupedRows.length - 1 !== groupedRowIndex) {
          dataToExport.push(emptyRow);
        }
      },
    );
    const blob = new Blob([JsonToCSV(dataToExport)], {
      type: 'text/csv;charset=utf-8;',
    });
    saveAs(blob, `runs-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
    analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
  }

  function onModelNotificationDelete(id: number): void {
    onNotificationDelete({ id, model });
  }

  function updateData(newData: any): void {
    const { data, params, metricsColumns, selectedRows } = processData(newData);
    const modelState = model.getState() as IRunsAppModelState;
    const tableData = getDataAsTableRows(data, metricsColumns, params);
    const tableColumns = getRunsTableColumns(
      metricsColumns,
      params,
      model.getState()?.config?.table.columnsOrder!,
      model.getState()?.config?.table.hiddenColumns!,
    );
    model.setState({
      data,
      rowData: newData,
      requestIsPending: false,
      infiniteIsPending: false,
      tableColumns,
      tableData: tableData.rows,
      selectedRows,
      sameValueColumns: tableData.sameValueColumns,
      config: {
        ...modelState?.config,
        pagination: {
          ...modelState?.config.pagination,
          isLatest: false,
        },
      },
    });

    const tableRef: any = model.getState()?.refs?.tableRef;
    tableRef.current?.updateData({
      newData: tableData.rows,
      newColumns: tableColumns,
      hiddenColumns: modelState?.config.table.hiddenColumns!,
    });
  }

  function destroy(): void {
    runsRequestRef.abort();
    liveUpdateInstance?.clear();
    liveUpdateInstance = null; //@TODO check is this need or not
  }

  function changeLiveUpdateConfig(config: {
    enabled?: boolean;
    delay?: number;
  }): void {
    const state = model.getState() as IRunsAppModelState;
    const configData = state?.config;
    const liveUpdateConfig = configData.liveUpdate;

    if (!liveUpdateConfig?.enabled && config.enabled) {
      const query = configData?.select?.query || '';
      const pagination = configData?.pagination;

      liveUpdateInstance = new LiveUpdateService(
        appName,
        updateData,
        config?.delay || liveUpdateConfig?.delay,
      );
      liveUpdateInstance.start({
        q: query,
        limit: pagination.limit + state?.rawData?.length || 0,
      });
    } else {
      liveUpdateInstance?.clear();
      liveUpdateInstance = null;
    }
    const newLiveUpdateConfig = {
      ...liveUpdateConfig,
      ...config,
    };
    model.setState({
      config: {
        ...configData,
        liveUpdate: newLiveUpdateConfig,
      },
    });

    setItem('runsLUConfig', encode(newLiveUpdateConfig));
    analytics.trackEvent(
      // @ts-ignore
      `${ANALYTICS_EVENT_KEYS[appName].liveUpdate} ${
        config.enabled ? 'on' : 'off'
      }`,
    );
  }

  function archiveRuns(
    ids: string[],
    archived: boolean,
  ): {
    call: () => Promise<void>;
    abort: () => void;
  } {
    runsArchiveRef = runsService.archiveRuns(ids, archived);
    return {
      call: async () => {
        try {
          /* await runsArchiveRef
              .call((detail) => exceptionHandler({ detail, model }))
              .then(() => {
                getRunsData(false, true).call((detail: any) => {
                  exceptionHandler({ detail, model });
                });
                onNotificationAdd({
                  notification: {
                    id: Date.now(),
                    severity: 'success',
                    message: `Runs are successfully ${
                      archived ? 'archived' : 'unarchived'
                    } `,
                  },
                  model,
                });
              });*/
        } catch (ex: Error | any) {
          if (ex.name === 'AbortError') {
            onNotificationAdd({
              notification: {
                id: Date.now(),
                severity: 'error',
                message: ex.message,
              },
              model,
            });
          }
        } finally {
          analytics.trackEvent(
            ANALYTICS_EVENT_KEYS.runs.table.archiveRunsBatch,
          );
        }
      },
      abort: runsArchiveRef.abort,
    };
  }

  function deleteRuns(ids: string[]): {
    call: () => Promise<void>;
    abort: () => void;
  } {
    runsDeleteRef = runsService.deleteRuns(ids);
    return {
      call: async () => {
        try {
          await runsDeleteRef
            .call((detail) => exceptionHandler({ detail, model }))
            .then(() => {
              getRunsData(false, true).call((detail: any) => {
                exceptionHandler({ detail, model });
              });
              onNotificationAdd({
                notification: {
                  id: Date.now(),
                  severity: 'success',
                  message: 'Runs are successfully deleted',
                },
                model,
              });
            });
        } catch (ex: Error | any) {
          if (ex.name === 'AbortError') {
            onNotificationAdd({
              notification: {
                id: Date.now(),
                severity: 'error',
                message: ex.message,
              },
              model,
            });
          }
        } finally {
          analytics.trackEvent(
            ANALYTICS_EVENT_KEYS[appName].table.deleteRunsBatch,
          );
        }
      },
      abort: runsDeleteRef.abort,
    };
  }

  const methods = {
    destroy,
    initialize,
    getRunsData,
    abortRequest,
    updateModelData,
    getLastRunsData,
    onExportTableData,
    onNotificationDelete: onModelNotificationDelete,
    setDefaultAppConfigData: setModelDefaultAppConfigData,
    changeLiveUpdateConfig,
    archiveRuns,
    deleteRuns,
  };

  if (grouping) {
    Object.assign(methods, {});
  }
  if (selectForm) {
    Object.assign(methods, {
      onSelectRunQueryChange(query: string): void {
        onSelectRunQueryChange({ query, model });
      },
    });
  }
  if (components?.charts?.[0]) {
    Object.assign(methods, {});
  }
  if (components?.table) {
    Object.assign(methods, {
      onRowHeightChange(height: RowHeightSize): void {
        onRowHeightChange({ height, model, appName });
      },
      onColumnsOrderChange(columnsOrder: any): void {
        onColumnsOrderChange({
          columnsOrder,
          model,
          appName,
          updateModelData,
        });
      },
      onColumnsVisibilityChange(hiddenColumns: string[]): void {
        onColumnsVisibilityChange({
          hiddenColumns,
          model,
          appName,
          updateModelData,
        });
      },
      onTableDiffShow(): void {
        onTableDiffShow({ model, appName, updateModelData });
      },
      onSortReset(): void {
        updateSortFields({
          sortFields: [],
          model,
          appName,
          updateModelData,
        });
      },
      updateColumnsWidths(key: string, width: number, isReset: boolean): void {
        updateColumnsWidths({
          key,
          width,
          isReset,
          model,
          appName,
          updateModelData,
        });
      },
      onRowSelect({
        actionType,
        data,
      }: {
        actionType: 'single' | 'selectAll' | 'removeAll';
        data?: any;
      }): void {
        return onRowSelect({ actionType, data, model });
      },
    });
  }

  return methods;
}
