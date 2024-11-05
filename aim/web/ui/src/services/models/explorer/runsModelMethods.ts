import moment from 'moment';
import { saveAs } from 'file-saver';
import _ from 'lodash-es';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { RowHeightSize } from 'config/table/tableConfigs';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DATE_EXPORTING_FORMAT, TABLE_DATE_FORMAT } from 'config/dates/dates';
import { getSuggestionsByExplorer } from 'config/monacoConfig/monacoConfig';
import { GroupNameEnum } from 'config/grouping/GroupingPopovers';
import { MetricsValueKeyEnum } from 'config/enums/tableEnums';

import {
  getRunsTableColumns,
  runsTableRowRenderer,
} from 'pages/Runs/components/RunsTableGrid/RunsTableGrid';

import * as analytics from 'services/analytics';
import runsService from 'services/api/runs/runsService';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';
import projectsService from 'services/api/projects/projectsService';

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
  IAppInitialConfig,
  IAppModelConfig,
  IAppModelState,
} from 'types/services/models/explorer/createAppModel';
import { ITagInfo } from 'types/pages/tags/Tags';

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
  decodeBufferPairs,
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
import { getValue } from 'utils/helper';
import onRowSelect from 'utils/app/onRowSelect';
import onToggleColumnsColorScales from 'utils/app/onToggleColumnsColorScales';
import onRunsTagsChange from 'utils/app/onRunsTagsChange';
import setRequestProgress from 'utils/app/setRequestProgress';
import { processDurationTime } from 'utils/processDurationTime';
import { getMetricsInitialRowData } from 'utils/app/getMetricsInitialRowData';
import { getMetricHash } from 'utils/app/getMetricHash';
import saveRecentSearches from 'utils/saveRecentSearches';
import onMetricsValueKeyChange from 'utils/app/onMetricsValueKeyChange';

import { InitialAppModelType } from './config';

// ************ Runs App Model Methods ************
function getRunsModelMethods(
  initialApp: InitialAppModelType,
  appConfig: IAppInitialConfig,
) {
  const { appName, grouping, components, selectForm } = appConfig;
  const { model, setModelDefaultAppConfigData } = initialApp;

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
    projectsService
      .getProjectParams(['metric'])
      .call()
      .then((data) => {
        model.setState({
          selectFormData: {
            suggestions: getSuggestionsByExplorer(appName, data),
          },
        });
      });
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
          messages: [err.message],
          severity: 'error',
        },
      });
    }
  }

  function abortRequest(): void {
    if (runsRequestRef) {
      runsRequestRef.abort();
    }
    setRequestProgress(model);
    model.setState({
      requestStatus: RequestStatusEnum.Ok,
    });
    onModelNotificationAdd({
      id: Date.now(),
      severity: 'info',
      messages: ['Request has been cancelled'],
    });
  }

  function onModelRunsTagsChange(runHash: string, tags: ITagInfo[]): void {
    onRunsTagsChange({ runHash, tags, model, updateModelData });
  }

  function getRunsData(
    shouldUrlUpdate?: boolean,
    shouldResetSelectedRows?: boolean,
    isInitial = true,
    queryString?: string,
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
    if (queryString) {
      configData.select.query = queryString;
    }
    const query = configData?.select?.query || '';
    const pagination = configData?.pagination;

    liveUpdateInstance?.stop().then();

    runsRequestRef = runsService.getRunsData(query, 45, pagination?.offset);
    let limit = pagination.limit;
    setRequestProgress(model);
    return {
      call: async () => {
        try {
          const stream = await runsRequestRef.call((detail) => {
            exceptionHandler({ detail, model });
          });
          let bufferPairs = decodeBufferPairs(stream as ReadableStream<any>);
          let decodedPairs = decodePathsVals(bufferPairs);
          let objects = iterFoldTree(decodedPairs, 1);

          const runsData: IRun<IMetricTrace | IParamTrace>[] = isInitial
            ? []
            : modelState?.rawData;
          let count = 0;
          for await (let [keys, val] of objects) {
            const data = { ...(val as any), hash: keys[0] };
            if (data.hash.startsWith('progress')) {
              const { 0: checked, 1: trackedRuns } = data;
              setRequestProgress(model, {
                matched: runsData.length,
                checked,
                trackedRuns,
              });
            } else {
              if (isInitial) {
                const runData: any = val;
                runsData.push({ ...runData, hash: keys[0] } as any);
              } else {
                if (count >= 0) {
                  const runData: any = val;
                  runsData.push({ ...runData, hash: keys[0] } as any);
                }
              }
              count++;
            }
          }
          const { data, params, metricsColumns, selectedRows, includeCreator } =
            processData(runsData);
          const tableData = getDataAsTableRows(data, metricsColumns, params);
          const tableColumns = getRunsTableColumns(
            metricsColumns,
            params,
            model.getState()?.config?.table.columnsOrder!,
            model.getState()?.config?.table.hiddenColumns!,
            includeCreator,
          );
          updateTableData(tableData, tableColumns, configData);

          model.setState({
            data,
            selectedRows: shouldResetSelectedRows
              ? {}
              : selectedRows ?? model.getState()?.selectedRows,
            rawData: runsData,
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
          saveRecentSearches(appName, query);
          if (shouldUrlUpdate) {
            updateURL({ configData, appName });
          }
        } catch (ex: Error | any) {
          if (ex.name === 'AbortError') {
            onNotificationAdd({
              notification: {
                id: Date.now(),
                severity: 'error',
                messages: [`${ex.name}, ${ex.message}`],
              },
              model,
            });
          }
        }
        const rowDataLength = model.getState()?.tableData?.length || 0;
        limit = rowDataLength >= 45 ? rowDataLength : 45;
        liveUpdateInstance?.start({
          q: query,
          limit,
        });
      },
      abort: runsRequestRef.abort,
    };
  }

  function updateModelData(
    configData = model.getState()!.config!,
    shouldURLUpdate?: boolean,
  ): void {
    const { data, params, metricsColumns, selectedRows, includeCreator } =
      processData(model.getState()?.rawData);
    const tableData = getDataAsTableRows(data, metricsColumns, params);
    const tableColumns: ITableColumn[] = getRunsTableColumns(
      metricsColumns,
      params,
      configData?.table?.columnsOrder!,
      configData?.table?.hiddenColumns!,
      includeCreator,
    );
    model.setState({
      config: configData,
      data,
      tableData: tableData.rows,
      tableColumns,
      sameValueColumns: tableData.sameValueColumns,
      selectedRows,
    });
    updateTableData(tableData, tableColumns, configData);
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
      model.setState({ requestStatus: RequestStatusEnum.Ok });
      model.getState()?.refs?.tableRef.current?.updateData({
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
      requestStatus: isInitial
        ? RequestStatusEnum.Pending
        : RequestStatusEnum.Ok,
      infiniteIsPending: !isInitial,
    });

    return model.getState();
  }

  function processData(data: any[]): {
    data: any[];
    params: string[];
    runProps: string[];
    metricsColumns: any;
    selectedRows: any;
    runHashArray: string[];
    unselectedRowsCount: number;
    includeCreator: boolean;
  } {
    const grouping = model.getState()?.config?.grouping;
    const paletteIndex: number = grouping?.paletteIndex || 0;
    const metricsColumns: Record<string, Record<string, any>> = {};
    const runHashArray: string[] = [];
    let selectedRows = model.getState()?.selectedRows;
    let runs: IParam[] = [];
    let params: string[] = [];
    let runProps: string[] = [];
    let unselectedRowsCount = 0;
    let includeCreator = false;
    data?.forEach((run: IRun<IParamTrace>, index) => {
      params = params.concat(getObjectPaths(run.params, run.params));
      runProps = runProps.concat(getObjectPaths(run.props, run.props));
      includeCreator = includeCreator || run.props.creator != null;
      const metricsValues: Record<
        string,
        Record<MetricsValueKeyEnum, number | string>
      > = {};
      run.traces.metric.forEach((trace) => {
        metricsColumns[trace.name] = {
          ...metricsColumns[trace.name],
          [contextToString(trace.context) as string]: '-',
        };
        const metricHash = getMetricHash(trace.name, trace.context as any);
        metricsValues[metricHash] = {
          min: trace.values.min,
          max: trace.values.max,
          last: trace.values.last,
          first: trace.values.first,
        };
      });
      runHashArray.push(run.hash);
      runs.push({
        run,
        isHidden: false,
        color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
        key: encode({ runHash: run.hash }),
        dasharray: DASH_ARRAYS[0],
        metricsValues,
      });
    });

    const processedData = groupData(runs);
    const uniqParams = _.uniq(params).sort();
    const uniqProps = _.uniq(runProps).sort();

    const mappedData =
      data?.reduce((acc: any, item: any) => {
        acc[item.hash] = { runHash: item.hash, ...item.props };
        return acc;
      }, {}) || {};
    if (selectedRows && !_.isEmpty(selectedRows)) {
      selectedRows = Object.keys(selectedRows).reduce(
        (acc: any, key: string) => {
          const slicedKey = key.slice(0, key.indexOf('/'));
          if (runHashArray.includes(slicedKey)) {
            acc[key] = {
              selectKey: key,
              ...mappedData[slicedKey],
            };
          } else {
            unselectedRowsCount++;
          }
          return acc;
        },
        {},
      );
    }
    return {
      data: processedData,
      params: uniqParams,
      runProps: uniqProps,
      metricsColumns,
      selectedRows,
      runHashArray,
      unselectedRowsCount,
      includeCreator,
    };
  }

  function groupData(data: any): IMetricsCollection<IMetric>[] {
    const configData = model.getState()!.config;
    const grouping = configData!.grouping;

    const groupByColor = getFilteredGroupingOptions({
      groupName: GroupNameEnum.COLOR,
      model,
    });
    const groupByStroke = getFilteredGroupingOptions({
      groupName: GroupNameEnum.STROKE,
      model,
    });
    const groupByChart = getFilteredGroupingOptions({
      groupName: GroupNameEnum.CHART,
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

    const metricsValueKey =
      model.getState()?.config?.table.metricsValueKey ||
      MetricsValueKeyEnum.LAST;
    const rows: any = processedData[0]?.config !== null ? {} : [];
    let rowIndex = 0;
    const sameValueColumns: string[] = [];
    const columnsFlattenValues: { [key: string]: Set<any> } = {};
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
          hash: '',
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
        const metricsRowValues = getMetricsInitialRowData(metricsColumns);
        metric.run.traces.metric.forEach((trace: any) => {
          const metricHash = getMetricHash(trace.name, trace.context);
          metricsRowValues[metricHash] = formatValue(
            trace.values[metricsValueKey],
          );
        });

        const rowValues: any = {
          key: metric.key,
          selectKey: `${metric.run.hash}/${metric.key}`,
          hash: metric.run.hash,
          index: rowIndex,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.dasharray,
          experiment: metric.run.props.experiment?.name ?? 'default',
          experiment_description:
            metric.run.props.experiment?.description ?? '-',
          experimentId: metric.run.props.experiment?.id ?? '',
          run: metric.run.props.name,
          description: metric.run.props?.description ?? '-',
          creator: metric.run.props?.creator?.username ?? '',
          date: moment(metric.run.props.creation_time * 1000).format(
            TABLE_DATE_FORMAT,
          ),
          duration: processDurationTime(
            metric.run.props.creation_time * 1000,
            metric.run.props.end_time
              ? metric.run.props.end_time * 1000
              : Date.now(),
          ),
          active: metric.run.props.active,
          metric: metric.name,
          tags: metric.run.props.tags.map((tag: any) => ({
            archived: false,
            color: tag.color,
            id: tag.id,
            comment: tag.description,
            name: tag.name,
            run_count: 0,
          })),
          ...metricsRowValues,
        };
        rowIndex++;
        [
          'experiment',
          'run',
          'hash',
          'date',
          'duration',
          'description',
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
            if (
              _.findIndex(columnsValues[paramKey], (paramValue) =>
                _.isEqual(value, paramValue),
              ) === -1
            ) {
              columnsValues[paramKey].push(value);
            }
          } else {
            columnsValues[paramKey] = [value];
          }
        });
        if (metricsCollection.config !== null) {
          rows[groupKey!].items.push(
            isRawData
              ? rowValues
              : runsTableRowRenderer(rowValues, onModelRunsTagsChange),
          );
        } else {
          rows.push(
            isRawData
              ? rowValues
              : runsTableRowRenderer(rowValues, onModelRunsTagsChange),
          );
        }
      });

      for (let columnKey in columnsValues) {
        columnsFlattenValues[columnKey] = new Set([
          ...(columnsFlattenValues[columnKey] || []),
          ...(columnsValues[columnKey] || []),
        ]);

        if (metricsCollection.config !== null) {
          rows[groupKey!].data[columnKey] =
            columnsValues[columnKey].length === 1
              ? columnsValues[columnKey][0]
              : columnsValues[columnKey];
        }

        if (metricsCollection.config !== null && !isRawData) {
          rows[groupKey!].data = runsTableRowRenderer(
            rows[groupKey!].data,
            onModelRunsTagsChange,
            true,
            Object.keys(columnsValues),
          );
        }
      }
    });
    for (let columnKey in columnsFlattenValues) {
      if (columnsFlattenValues[columnKey].size === 1) {
        sameValueColumns.push(columnKey);
      }
    }
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
    const { data, params, metricsColumns, includeCreator } = processData(
      model.getState()?.rawData,
    );
    const tableData = getDataAsTableRows(data, metricsColumns, params, true);
    const configData = model.getState()?.config;
    const tableColumns: ITableColumn[] = getRunsTableColumns(
      metricsColumns,
      params,
      configData?.table.columnsOrder!,
      configData?.table.hiddenColumns!,
      includeCreator,
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
        : [
            Array.isArray(tableData.rows)
              ? tableData.rows
              : tableData.rows[Object.keys(tableData.rows)[0]].items,
          ];

    const dataToExport: { [key: string]: string }[] = [];

    groupedRows?.forEach(
      (groupedRow: IMetricTableRowData[], groupedRowIndex: number) => {
        groupedRow?.forEach((row: IMetricTableRowData) => {
          const filteredRow = getFilteredRow({
            columnKeys: filteredHeader,
            row,
          });
          dataToExport.push(filteredRow);
        });
        if (groupedRows?.length - 1 !== groupedRowIndex) {
          dataToExport.push(emptyRow);
        }
      },
    );
    const blob = new Blob([JsonToCSV(dataToExport)], {
      type: 'text/csv;charset=utf-8;',
    });
    saveAs(blob, `runs-${moment().format(DATE_EXPORTING_FORMAT)}.csv`);
    analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
  }

  function onModelNotificationDelete(id: number): void {
    onNotificationDelete({ id, model });
  }

  function updateData(newData: any): void {
    const {
      data,
      params,
      metricsColumns,
      selectedRows,
      unselectedRowsCount,
      includeCreator,
    } = processData(newData);
    if (unselectedRowsCount) {
      onNotificationAdd({
        notification: {
          id: Date.now(),
          severity: 'info',
          closeDelay: 5000,
          messages: [
            'Live update: runs have been updated.',
            `${unselectedRowsCount} of selected runs have been left out of the table.`,
          ],
        },
        model,
      });
    }

    const modelState = model.getState() as IRunsAppModelState;
    const tableData = getDataAsTableRows(data, metricsColumns, params);
    const tableColumns = getRunsTableColumns(
      metricsColumns,
      params,
      model.getState()?.config?.table.columnsOrder!,
      model.getState()?.config?.table.hiddenColumns!,
      includeCreator,
    );
    const lastRowKey = newData[newData.length - 1].hash;
    model.setState({
      requestStatus: RequestStatusEnum.Ok,
      data,
      rowData: newData,
      infiniteIsPending: false,
      tableColumns,
      tableData: tableData.rows,
      selectedRows,
      sameValueColumns: tableData.sameValueColumns,
      config: {
        ...modelState?.config,
        pagination: {
          ...modelState?.config.pagination,
          offset: lastRowKey,
          isLatest: false,
        },
      },
    });

    model.getState()?.refs?.tableRef.current?.updateData({
      newData: tableData.rows,
      newColumns: tableColumns,
      hiddenColumns: modelState?.config.table.hiddenColumns!,
    });
  }

  function destroy(): void {
    runsRequestRef.abort();
    liveUpdateInstance?.clear();
    liveUpdateInstance = null; //@TODO check is this need or not
    model.setState({
      ...model.getState(),
      selectFormData: {
        ...model.getState().selectFormData,
        error: null,
      },
    });
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
      const rowDataLength = model.getState()?.tableData?.length || 0;
      const limit = rowDataLength >= 45 ? rowDataLength : 45;
      liveUpdateInstance = new LiveUpdateService(
        appName,
        updateData,
        config?.delay || liveUpdateConfig?.delay,
      );
      liveUpdateInstance.start({
        q: query,
        limit,
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
          await runsArchiveRef
            .call((detail) => exceptionHandler({ detail, model }))
            .then(() => {
              getRunsData(false, true).call((detail: any) => {
                exceptionHandler({ detail, model });
              });
              onNotificationAdd({
                notification: {
                  id: Date.now(),
                  severity: 'success',
                  messages: [
                    `Runs are successfully ${
                      archived ? 'archived' : 'unarchived'
                    } `,
                  ],
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
                messages: [ex.message],
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
                  messages: ['Runs are successfully deleted'],
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
                messages: [ex.message],
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
    onRunsTagsChange: onModelRunsTagsChange,
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
      onMetricsValueKeyChange(metricsValueKey: MetricsValueKeyEnum): void {
        onMetricsValueKeyChange({
          metricsValueKey,
          model,
          appName,
          updateModelData,
        });
      },
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
      onToggleColumnsColorScales(colKey: string): void {
        onToggleColumnsColorScales({
          colKey,
          model,
          appName,
          updateModelData,
        });
      },
    });
  }

  return methods;
}

export default getRunsModelMethods;
