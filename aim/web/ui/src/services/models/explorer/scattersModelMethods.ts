import moment from 'moment';
import { saveAs } from 'file-saver';
import _ from 'lodash-es';

import { IPoint } from 'components/ScatterPlot';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { MetricsValueKeyEnum, ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DATE_EXPORTING_FORMAT, TABLE_DATE_FORMAT } from 'config/dates/dates';
import { getSuggestionsByExplorer } from 'config/monacoConfig/monacoConfig';
import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import {
  getParamsTableColumns,
  paramsTableRowRenderer,
} from 'pages/Params/components/ParamsTableGrid/ParamsTableGrid';

import * as analytics from 'services/analytics';
import runsService from 'services/api/runs/runsService';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';
import projectsService from 'services/api/projects/projectsService';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  IGroupingSelectOption,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ITooltip,
} from 'types/services/models/metrics/metricsAppModel';
import { IParamTrace, IRun } from 'types/services/models/metrics/runModel';
import { IModel } from 'types/services/models/model';
import {
  IParam,
  IParamsAppModelState,
} from 'types/services/models/params/paramsAppModel';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { IDimensionType } from 'types/utils/d3/drawParallelAxes';
import {
  IAppInitialConfig,
  IAppModelConfig,
  IAppModelState,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';
import { IProjectParamsMetrics } from 'types/services/models/projects/projectsModel';
import {
  IScatterAppModelState,
  ITrendlineOptions,
} from 'types/services/models/scatter/scatterAppModel';
import { ITagInfo, ITagProps } from 'types/pages/tags/Tags';

import exceptionHandler from 'utils/app/exceptionHandler';
import getChartTitleData from 'utils/app/getChartTitleData';
import { getFilteredGroupingOptions } from 'utils/app/getFilteredGroupingOptions';
import getFilteredRow from 'utils/app/getFilteredRow';
import { getGroupingPersistIndex } from 'utils/app/getGroupingPersistIndex';
import getGroupingSelectOptions from 'utils/app/getGroupingSelectOptions';
import getRunData from 'utils/app/getRunData';
import onChangeTooltip from 'utils/app/onChangeTooltip';
import onColumnsOrderChange from 'utils/app/onColumnsOrderChange';
import onColumnsVisibilityChange from 'utils/app/onColumnsVisibilityChange';
import onGroupingApplyChange from 'utils/app/onGroupingApplyChange';
import onGroupingModeChange from 'utils/app/onGroupingModeChange';
import onGroupingPaletteChange from 'utils/app/onGroupingPaletteChange';
import onGroupingPersistenceChange from 'utils/app/onGroupingPersistenceChange';
import onGroupingReset from 'utils/app/onGroupingReset';
import onGroupingSelectChange from 'utils/app/onGroupingSelectChange';
import onSelectOptionsChange from 'utils/app/onSelectOptionsChange';
import onParamVisibilityChange from 'utils/app/onParamsVisibilityChange';
import onRowHeightChange from 'utils/app/onRowHeightChange';
import onRowVisibilityChange from 'utils/app/onRowVisibilityChange';
import onSelectRunQueryChange from 'utils/app/onSelectRunQueryChange';
import onSortFieldsChange from 'utils/app/onSortFieldsChange';
import { onTableDiffShow } from 'utils/app/onTableDiffShow';
import { onTableResizeEnd } from 'utils/app/onTableResizeEnd';
import onTableResizeModeChange from 'utils/app/onTableResizeModeChange';
import onTableRowClick from 'utils/app/onTableRowClick';
import onTableRowHover from 'utils/app/onTableRowHover';
import onTableSortChange from 'utils/app/onTableSortChange';
import updateColumnsWidths from 'utils/app/updateColumnsWidths';
import updateSortFields from 'utils/app/updateTableSortFields';
import contextToString from 'utils/contextToString';
import { ChartTypeEnum, ScaleEnum } from 'utils/d3';
import { formatValue } from 'utils/formatValue';
import getObjectPaths from 'utils/getObjectPaths';
import JsonToCSV from 'utils/JsonToCSV';
import { setItem } from 'utils/storage';
import { encode } from 'utils/encoder/encoder';
import onBookmarkCreate from 'utils/app/onBookmarkCreate';
import onBookmarkUpdate from 'utils/app/onBookmarkUpdate';
import onNotificationDelete from 'utils/app/onNotificationDelete';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import onResetConfigData from 'utils/app/onResetConfigData';
import onShuffleChange from 'utils/app/onShuffleChange';
import updateURL from 'utils/app/updateURL';
import getValueByField from 'utils/getValueByField';
import getTooltipContent from 'utils/getTooltipContent';
import { getValue } from 'utils/helper';
import onRowSelect from 'utils/app/onRowSelect';
import { SortField } from 'utils/getSortedFields';
import onChangeTrendlineOptions from 'utils/app/onChangeTrendlineOptions';
import onRunsTagsChange from 'utils/app/onRunsTagsChange';
import setRequestProgress from 'utils/app/setRequestProgress';
import { minMaxOfArray } from 'utils/minMaxOfArray';
import { processDurationTime } from 'utils/processDurationTime';
import getSelectOptions from 'utils/app/getSelectOptions';
import { getMetricsSelectOptions } from 'utils/app/getMetricsSelectOptions';
import onRowsVisibilityChange from 'utils/app/onRowsVisibilityChange';
import { getMetricsInitialRowData } from 'utils/app/getMetricsInitialRowData';
import { getMetricHash } from 'utils/app/getMetricHash';
import { getMetricLabel } from 'utils/app/getMetricLabel';

import { InitialAppModelType } from './config';

import { AppNameEnum } from './index';

// ************ Scatters App Model Methods

function getScattersModelMethods(
  initialApp: InitialAppModelType,
  appConfig: IAppInitialConfig,
) {
  const { appName, grouping, components, selectForm } = appConfig;
  const {
    model,
    getModelAppConfigData,
    setModelDefaultAppConfigData,
    getConfig,
  } = initialApp;

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

  function initialize(appId: string): void {
    model.init();
    const state: Partial<IScatterAppModelState> = {};
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
    const liveUpdateState = model.getState()?.config?.liveUpdate;

    projectsService
      .getProjectParams(['metric'])
      .call()
      .then((data: IProjectParamsMetrics) => {
        model.setState({
          selectFormData: {
            options: getSelectOptions(data),
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
  }

  function updateData(newData: IRun<IParamTrace>[]): void {
    const configData = model.getState()?.config;
    if (configData) {
      setModelData(newData, configData);
    }
  }

  function setModelData(
    rawData: IRun<IParamTrace>[],
    configData: IAppModelConfig,
  ): void {
    const {
      data,
      runProps,
      highLevelParams,
      params,
      metricsColumns,
      selectedRows,
    } = processData(rawData);
    const modelState: IAppModelState = model.getState();
    const sortedParams = [...new Set(params.concat(highLevelParams))].sort();
    const groupingSelectOptions = [
      ...getGroupingSelectOptions({
        params: sortedParams,
        runProps,
      }),
    ];
    const metricsSelectOptions = getMetricsSelectOptions(metricsColumns, model);
    const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

    const tableData = getDataAsTableRows(
      data,
      metricsColumns,
      params,
      false,
      configData,
      groupingSelectOptions,
    );
    const sortFields = modelState?.config?.table.sortFields;

    const tableColumns = getParamsTableColumns(
      sortOptions,
      metricsColumns,
      params,
      data[0]?.config,
      configData.table?.columnsOrder!,
      configData.table?.hiddenColumns!,
      configData.table?.metricsValueKey,
      sortFields,
      onSortChange,
      configData.grouping as any,
      onModelGroupingSelectChange,
      AppNameEnum.SCATTERS,
    );

    modelState?.refs?.tableRef.current?.updateData({
      newData: tableData.rows,
      newColumns: tableColumns,
    });

    model.setState({
      requestStatus: RequestStatusEnum.Ok,
      data,
      chartData: getChartData(data),
      chartTitleData: getChartTitleData<IParam, IParamsAppModelState>({
        processedData: data,
        groupingSelectOptions,
        model: model as IModel<IParamsAppModelState>,
      }),
      selectFormData: { ...modelState.selectFormData, error: null },
      params,
      metricsColumns,
      rawData,
      config: configData,
      tableData: tableData.rows,
      tableColumns,
      sameValueColumns: tableData.sameValueColumns,
      groupingSelectOptions,
      sortOptions,
      selectedRows,
    });
  }

  function getChartData(
    processedData: IMetricsCollection<IParam>[],
    configData = model.getState()?.config,
  ): {
    dimensions: IDimensionType[];
    data: IPoint[];
  }[] {
    if (!processedData || _.isEmpty(configData.select.options)) {
      return [];
    }
    const dimensionsByChartIndex: {
      values: number[] | string[];
      scaleType: ScaleEnum;
      displayName: string;
      dimensionType: string;
    }[][] = [];

    const chartData = processedData.map(
      ({ chartIndex, color, data }: IMetricsCollection<IParam>) => {
        if (!dimensionsByChartIndex[chartIndex]) {
          dimensionsByChartIndex[chartIndex] = [];
        }
        const dimension: any = dimensionsByChartIndex[chartIndex];
        return data
          .filter((run) => !run.isHidden)
          .map((run: IParam) => {
            const values: any = [];
            configData.select.options.forEach(
              ({ type, label, value }: ISelectOption, i: number) => {
                if (!dimension[i]) {
                  dimension[i] = {
                    values: [],
                    scaleType: ScaleEnum.Linear,
                    displayName: label,
                    dimensionType: 'param',
                  };
                }
                if (type === 'metrics') {
                  run.run.traces.metric.forEach((trace: IParamTrace) => {
                    if (
                      trace.name === value?.option_name &&
                      _.isEqual(trace.context, value?.context)
                    ) {
                      let lastValue = trace.values.last;
                      const formattedLastValue = formatValue(lastValue, '-');
                      values[i] = lastValue;
                      if (formattedLastValue !== '-') {
                        const metricLabel = getMetricLabel(
                          trace.name,
                          trace.context as any,
                        );
                        dimension[i].dimensionType = 'metric';
                        dimension[i].displayName = metricLabel;
                        if (typeof lastValue !== 'number') {
                          dimension[i].scaleType = ScaleEnum.Point;
                          values[i] = formattedLastValue;
                        } else if (isNaN(lastValue) || !isFinite(lastValue)) {
                          values[i] = formattedLastValue;
                          dimension[i].scaleType = ScaleEnum.Point;
                        }
                        dimension[i].values.push(values[i]);
                      }
                    }
                  });
                } else {
                  const paramValue = getValue(run.run.params, label, '-');
                  const formattedParam = formatValue(paramValue, '-');
                  values[i] = paramValue;
                  if (formattedParam !== '-') {
                    if (typeof paramValue !== 'number') {
                      dimension[i].scaleType = ScaleEnum.Point;
                      values[i] = formattedParam;
                    } else if (isNaN(paramValue) || !isFinite(paramValue)) {
                      values[i] = formattedParam;
                      dimension[i].scaleType = ScaleEnum.Point;
                    }
                    dimension[i].values.push(values[i]);
                  }
                }
              },
            );

            return {
              chartIndex,
              key: run.key,
              groupKey: run.key,
              color: color ?? run.color,
              data: {
                yValues: [values[0] ?? '-'],
                xValues: [values[1] ?? '-'],
              },
            };
          });
      },
    );
    const flattedData = chartData.flat();
    const groupedByChartIndex = Object.values(
      _.groupBy(flattedData, 'chartIndex'),
    );

    return dimensionsByChartIndex
      .filter((dimension) => !_.isEmpty(dimension))
      .map((chartDimensions, i: number) => {
        const dimensions: IDimensionType[] = [];
        chartDimensions.forEach((dimension) => {
          if (dimension.scaleType === ScaleEnum.Linear) {
            const [minDomain = '-', maxDomain = '-'] = minMaxOfArray([
              ...((dimension.values as number[]) || []),
            ]);

            dimensions.push({
              scaleType: dimension.scaleType,
              domainData: [minDomain, maxDomain] as string[] | number[],
              displayName: dimension.displayName,
              dimensionType: dimension.dimensionType,
            });
          } else {
            const numDomain: number[] = [];
            const strDomain: string[] = [];

            [...dimension.values].forEach((data) => {
              if (typeof data === 'number') {
                numDomain.push(data);
              } else {
                strDomain.push(data);
              }
            });

            // sort domain data
            numDomain.sort((a, b) => a - b);
            strDomain.sort();

            dimensions.push({
              scaleType: dimension.scaleType,
              domainData: numDomain.concat(strDomain as any[]),
              displayName: dimension.displayName,
              dimensionType: dimension.dimensionType,
            });
          }
        });
        return {
          dimensions,
          data: groupedByChartIndex[i],
        };
      });
  }

  function getDataAsTableRows(
    processedData: IMetricsCollection<IParam>[],
    metricsColumns: any,
    paramKeys: string[],
    isRowData: boolean,
    config: IAppModelConfig,
    groupingSelectOptions: IGroupingSelectOption[],
  ): { rows: IMetricTableRowData[] | any; sameValueColumns: string[] } {
    if (!processedData) {
      return {
        rows: [],
        sameValueColumns: [],
      };
    }

    const rows: IMetricTableRowData[] | any =
      processedData[0]?.config !== null ? {} : [];

    let rowIndex = 0;
    const sameValueColumns: string[] = [];
    const columnsFlattenValues: { [key: string]: Set<any> } = {};

    processedData.forEach((metricsCollection: IMetricsCollection<IParam>) => {
      const groupKey = metricsCollection.key;
      const columnsValues: { [key: string]: string[] } = {};

      if (metricsCollection.config !== null) {
        const groupConfigData: { [key: string]: unknown } = {};
        for (let key in metricsCollection.config) {
          groupConfigData[getValueByField(groupingSelectOptions, key)] =
            metricsCollection.config[key];
        }
        const groupHeaderRow = {
          meta: {
            chartIndex: config?.grouping?.chart?.length
              ? metricsCollection.chartIndex + 1
              : null,
            //ToDo reverse mode
            // config.grouping?.reverseMode?.chart
            //   ? metricsCollection.chartIndex + 1
            //   : null,
            color: metricsCollection.color,
            dasharray: metricsCollection.dasharray,
            itemsCount: metricsCollection.data.length,
            config: groupConfigData,
          },
          key: groupKey!,
          groupRowsKeys: metricsCollection.data.map((metric) => metric.key),
          color: metricsCollection.color,
          hash: '',
          dasharray: metricsCollection.dasharray,
          experiment: '',
          run: '',
          date: '',
          description: '',
          metric: '',
          context: [],
          children: [],
          groups: groupConfigData,
        };

        rows[groupKey!] = {
          data: groupHeaderRow,
          items: [],
        };
      }

      metricsCollection.data.forEach((metric: any) => {
        const metricsRowValues = getMetricsInitialRowData(metricsColumns);
        metric.run.traces.metric.forEach((trace: any) => {
          const metricHash = getMetricHash(trace.name, trace.context as any);
          metricsRowValues[metricHash] = formatValue(trace.values.last);
        });
        const rowValues: any = {
          rowMeta: {
            color: metricsCollection.color ?? metric.color,
          },
          key: metric.key,
          selectKey: `${metric.run.hash}/${metric.key}`,
          hash: metric.run.hash,
          isHidden: metric.isHidden,
          index: rowIndex,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.dasharray,
          experiment: metric.run.props.experiment?.name ?? 'default',
          experimentId: metric.run.props.experiment?.id ?? '',
          experiment_description:
            metric.run.props.experiment?.description ?? '-',
          run: metric.run.props?.name ?? '-',
          description: metric.run.props?.description ?? '-',
          date: moment(metric.run.props.creation_time * 1000).format(
            TABLE_DATE_FORMAT,
          ),
          tags: metric.run.props.tags.map((tag: ITagProps) => ({
            archived: false,
            color: tag.color,
            id: tag.id,
            comment: tag.description,
            name: tag.name,
            run_count: 0,
          })),
          metric: metric.name,
          duration: processDurationTime(
            metric.run.props.creation_time * 1000,
            metric.run.props.end_time
              ? metric.run.props.end_time * 1000
              : Date.now(),
          ),
          active: metric.run.props.active,
          ...metricsRowValues,
        };
        rowIndex++;

        for (let key in metricsRowValues) {
          columnsValues[key] = ['-'];
        }

        [
          'experiment',
          'run',
          'hash',
          'metric',
          'context',
          'date',
          'duration',
          'description',
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
            isRowData
              ? rowValues
              : paramsTableRowRenderer(rowValues, onModelRunsTagsChange, {
                  toggleVisibility: (e) => {
                    e.stopPropagation();
                    onRowVisibilityChange({
                      metricKey: rowValues.key,
                      model,
                      appName,
                      updateModelData,
                    });
                  },
                }),
          );
        } else {
          rows.push(
            isRowData
              ? rowValues
              : paramsTableRowRenderer(rowValues, onModelRunsTagsChange, {
                  toggleVisibility: (e) => {
                    e.stopPropagation();
                    onRowVisibilityChange({
                      metricKey: rowValues.key,
                      model,
                      appName,
                      updateModelData,
                    });
                  },
                }),
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
              ? paramKeys.includes(columnKey)
                ? formatValue(columnsValues[columnKey][0])
                : columnsValues[columnKey][0]
              : columnsValues[columnKey];
        }
      }

      if (metricsCollection.config !== null && !isRowData) {
        rows[groupKey!].data = paramsTableRowRenderer(
          rows[groupKey!].data,
          onModelRunsTagsChange,
          {},
          true,
          ['groups'].concat(Object.keys(columnsValues)),
        );
      }
    });
    for (let columnKey in columnsFlattenValues) {
      if (columnsFlattenValues[columnKey].size === 1) {
        sameValueColumns.push(columnKey);
      }
    }
    return { rows, sameValueColumns };
  }

  function processData(data: IRun<IParamTrace>[]): {
    data: IMetricsCollection<IParam>[];
    params: string[];
    highLevelParams: string[];
    runProps: string[];
    metricsColumns: any;
    selectedRows: any;
  } {
    const configData = model.getState()?.config;
    let selectedRows = model.getState()?.selectedRows;
    const grouping = configData?.grouping;
    let runs: IParam[] = [];
    let params: string[] = [];
    let runProps: string[] = [];
    let highLevelParams: string[] = [];
    const paletteIndex: number = grouping?.paletteIndex || 0;
    const metricsColumns: any = {};

    data?.forEach((run: IRun<IParamTrace>, index) => {
      params = params.concat(getObjectPaths(run.params, run.params));
      runProps = runProps.concat(getObjectPaths(run.props, run.props));
      highLevelParams = highLevelParams.concat(
        getObjectPaths(run.params, run.params, '', false, true),
      );
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
      const paramKey = encode({ runHash: run.hash });
      runs.push({
        run,
        isHidden: configData!.table.hiddenMetrics!.includes(paramKey),
        color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
        key: paramKey,
        metricsValues,
        dasharray: DASH_ARRAYS[0],
      });
    });

    let sortFields = configData?.table?.sortFields ?? [];

    if (sortFields?.length === 0) {
      sortFields = [
        {
          value: 'run.props.creation_time',
          order: 'desc',
          label: '',
          group: '',
        },
      ];
    }

    const processedData = groupData(
      _.orderBy(
        runs,
        sortFields?.map(
          (f: SortField) =>
            function (run: IParam) {
              return getValue(run, f.value, '');
            },
        ),
        sortFields?.map((f: SortField) => f.order),
      ),
    );

    const uniqProps = _.uniq(runProps).sort();
    const uniqParams = _.uniq(params).sort();
    const uniqHighLevelParams = _.uniq(highLevelParams).sort();

    const mappedData: Record<string, any> = {};

    for (let run of runs) {
      mappedData[run.run.hash] = {
        runHash: run.run.hash,
        ...run.run.props,
        ...run,
      };
    }

    let selected: Record<string, any> = {};

    if (selectedRows && !_.isEmpty(selectedRows)) {
      for (let rowKey in selectedRows) {
        const slicedKey = rowKey.slice(0, rowKey.indexOf('/'));
        if (mappedData[slicedKey])
          selected[rowKey] = {
            selectKey: rowKey,
            ...mappedData[slicedKey],
          };
      }
    }

    return {
      data: processedData,
      params: uniqParams,
      highLevelParams: uniqHighLevelParams,
      runProps: uniqProps,
      metricsColumns,
      selectedRows,
    };
  }

  function groupData(data: IParam[]): IMetricsCollection<IParam>[] {
    const grouping = model.getState()!.config!.grouping;
    const { paletteIndex } = grouping;
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
          data,
        },
      ];
    }

    const groupValues: {
      [key: string]: IMetricsCollection<IParam> | any;
    } = {};

    const groupingFields = _.uniq(
      groupByColor.concat(groupByStroke).concat(groupByChart),
    );

    for (let i = 0; i < data.length; i++) {
      const groupValue: { [key: string]: unknown } = {};
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
    return Object.values(groupValues);
  }

  function updateModelData(
    configData = model.getState()!.config!,
    shouldURLUpdate?: boolean,
  ): void {
    const {
      data,
      params,
      runProps,
      highLevelParams,
      metricsColumns,
      selectedRows,
    } = processData(model.getState()?.rawData as IRun<IParamTrace>[]);
    const sortedParams = [...new Set(params.concat(highLevelParams))].sort();
    const groupingSelectOptions = [
      ...getGroupingSelectOptions({
        params: sortedParams,
        runProps,
      }),
    ];
    const metricsSelectOptions = getMetricsSelectOptions(metricsColumns, model);
    const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

    const tableData = getDataAsTableRows(
      data,
      metricsColumns,
      params,
      false,
      configData,
      groupingSelectOptions,
    );
    const tableColumns = getParamsTableColumns(
      sortOptions,
      metricsColumns,
      params,
      data[0]?.config,
      configData.table?.columnsOrder!,
      configData.table?.hiddenColumns!,
      configData.table?.metricsValueKey,
      configData.table?.sortFields,
      onSortChange,
      configData.grouping as any,
      onModelGroupingSelectChange,
      AppNameEnum.SCATTERS,
    );

    model.getState()?.refs?.tableRef.current?.updateData({
      newData: tableData.rows,
      newColumns: tableColumns,
      hiddenColumns: configData.table?.hiddenColumns!,
    });

    if (shouldURLUpdate) {
      updateURL({ configData, appName });
    }

    model.setState({
      config: configData,
      data,
      chartData: getChartData(data),
      chartTitleData: getChartTitleData<IParam, IScatterAppModelState>({
        processedData: data,
        groupingSelectOptions,
        model: model as IModel<IScatterAppModelState>,
      }),
      groupingSelectOptions,
      sortOptions,
      tableData: tableData.rows,
      tableColumns,
      sameValueColumns: tableData.sameValueColumns,
      selectedRows,
    });
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

  function getScattersData(
    shouldUrlUpdate?: boolean,
    shouldResetSelectedRows?: boolean,
  ): {
    call: () => Promise<void>;
    abort: () => void;
  } {
    if (runsRequestRef) {
      runsRequestRef.abort();
    }
    const configData = { ...model.getState()?.config };

    runsRequestRef = runsService.getRunsData(configData?.select?.query);
    setRequestProgress(model);
    return {
      call: async () => {
        if (_.isEmpty(configData?.select?.options)) {
          resetModelState(configData, shouldResetSelectedRows!);
        } else {
          model.setState({
            requestStatus: RequestStatusEnum.Pending,
            queryIsEmpty: false,
            selectedRows: shouldResetSelectedRows
              ? {}
              : model.getState()?.selectedRows,
          });
          liveUpdateInstance?.stop().then();
          try {
            const stream = await runsRequestRef.call((detail) => {
              exceptionHandler({ detail, model });
              resetModelState(configData, shouldResetSelectedRows!);
            });
            const runData = await getRunData(stream, (progress) =>
              setRequestProgress(model, progress),
            );
            updateData(runData);
            if (shouldUrlUpdate) {
              updateURL({ configData, appName });
            }
            liveUpdateInstance?.start({
              q: configData?.select?.query,
            });
            //Changed the layout/styles of the experiments and tags tables to look more like lists|| Extend the contributions section (add activity feed under the contributions)
          } catch (ex: Error | any) {
            if (ex.name === 'AbortError') {
              onNotificationAdd({
                notification: {
                  messages: [ex.message],
                  id: Date.now(),
                  severity: 'error',
                },
                model,
              });
            }
          }
        }
      },
      abort: runsRequestRef.abort,
    };
  }

  function resetModelState(
    configData: any,
    shouldResetSelectedRows: boolean,
  ): void {
    let state: Partial<IScatterAppModelState> = {};
    if (components?.charts?.indexOf(ChartTypeEnum.ScatterPlot) !== -1) {
      state.chartData = [];
    }
    if (components.table) {
      state.tableData = [];
      state.config = {
        ...configData,
        table: {
          ...configData?.table,
          resizeMode: ResizeModeEnum.Resizable,
        },
      };
    }
    model.setState({
      queryIsEmpty: true,
      rawData: [],
      tableColumns: [],
      selectFormData: {
        ...model.getState().selectFormData,
        error: null,
      },
      selectedRows: shouldResetSelectedRows
        ? {}
        : model.getState()?.selectedRows,
      ...state,
    });
  }

  function onExportTableData(): void {
    const { data, params, config, metricsColumns, groupingSelectOptions } =
      model.getState() as IParamsAppModelState;
    const tableData = getDataAsTableRows(
      data,
      metricsColumns,
      params,
      true,
      config,
      groupingSelectOptions,
    );
    const metricsSelectOptions = getMetricsSelectOptions(metricsColumns, model);
    const sortOptions = [...groupingSelectOptions, ...metricsSelectOptions];

    const tableColumns: ITableColumn[] = getParamsTableColumns(
      sortOptions,
      metricsColumns,
      params,
      data[0]?.config,
      config.table?.columnsOrder!,
      config.table?.hiddenColumns!,
      config.table?.metricsValueKey,
      config.table?.sortFields,
      onSortChange,
      config.grouping as any,
      onModelGroupingSelectChange,
      AppNameEnum.SCATTERS,
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
          const filteredRow = getFilteredRow<IMetricTableRowData>({
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
    saveAs(blob, `${appName}-${moment().format(DATE_EXPORTING_FORMAT)}.csv`);
    analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
  }

  function onActivePointChange(
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ): void {
    const { data, refs, config, groupingSelectOptions } = model.getState();
    if (config.table.resizeMode !== ResizeModeEnum.Hide) {
      const tableRef: any = refs?.tableRef;
      if (tableRef) {
        if (focusedStateActive) {
          tableRef.current?.scrollToRow?.(activePoint.key);
          tableRef.current?.setActiveRow?.(
            focusedStateActive ? activePoint.key : null,
          );
        } else {
          tableRef.current?.setHoveredRow?.(activePoint.key);
        }
      }
    }
    let configData = config;
    if (configData?.chart) {
      // TODO remove this later
      // remove unnecessary content prop from tooltip config
      if (configData.chart.tooltip?.hasOwnProperty('content')) {
        delete configData.chart.tooltip.content;
      }

      configData = {
        ...configData,
        chart: {
          ...configData.chart,
          focusedState: {
            active: focusedStateActive,
            key: activePoint.key,
            xValue: activePoint.xValue,
            yValue: activePoint.yValue,
            chartIndex: activePoint.chartIndex,
          },
        },
      };

      if (
        config.chart.focusedState.active !== focusedStateActive ||
        (config.chart.focusedState.active &&
          (activePoint.key !== config.chart.focusedState.key ||
            activePoint.xValue !== config.chart.focusedState.xValue))
      ) {
        updateURL({ configData, appName });
      }
    }

    const tooltipData = {
      ...configData?.chart?.tooltip,
      content: getTooltipContent({
        groupingNames: [GroupNameEnum.COLOR, GroupNameEnum.CHART],
        groupingSelectOptions,
        data,
        configData,
        activePointKey: configData.chart?.focusedState?.key,
        selectedFields: configData.chart?.tooltip?.selectedFields,
      }),
    };
    model.setState({ config: configData, tooltip: tooltipData });
  }

  function onModelRunsTagsChange(runHash: string, tags: ITagInfo[]): void {
    onRunsTagsChange({ runHash, tags, model, updateModelData });
  }

  function onModelGroupingSelectChange({
    groupName,
    list,
  }: IOnGroupingSelectChangeParams): void {
    onGroupingSelectChange({
      groupName,
      list,
      model,
      appName,
      updateModelData,
    });
  }

  function onSortChange({
    sortFields,
    order,
    index,
    actionType,
    field,
  }: any): void {
    onTableSortChange({
      sortFields,
      order,
      index,
      field,
      actionType,
      model,
      appName,
      updateModelData,
    });
  }

  function onModelBookmarkCreate({
    name,
    description,
  }: {
    name: string;
    description: string;
  }): Promise<void> {
    return onBookmarkCreate({ name, description, model, appName });
  }

  function onModelBookmarkUpdate(id: string): void {
    onBookmarkUpdate({ id, model, appName });
  }

  function onModelNotificationDelete(id: number): void {
    onNotificationDelete({ id, model });
  }

  function onModelNotificationAdd<N>(notification: N & INotification): void {
    onNotificationAdd({ notification, model });
  }

  function onModelResetConfigData(): void {
    onResetConfigData({ model, getConfig, updateModelData });
  }

  function changeLiveUpdateConfig(config: {
    enabled?: boolean;
    delay?: number;
  }): void {
    const state = model.getState();
    const configData = state?.config;
    const query = configData.select?.query;
    const liveUpdateConfig = configData.liveUpdate;
    if (!liveUpdateConfig?.enabled && config.enabled && query !== '()') {
      liveUpdateInstance = new LiveUpdateService(
        appName,
        updateData,
        config?.delay || liveUpdateConfig?.delay,
      );
      liveUpdateInstance?.start({
        q: query,
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

    setItem('scattersLUConfig', encode(newLiveUpdateConfig));
    analytics.trackEvent(
      // @ts-ignore
      `${ANALYTICS_EVENT_KEYS[appName].liveUpdate} ${
        config.enabled ? 'on' : 'off'
      }`,
    );
  }

  function destroy(): void {
    liveUpdateInstance?.clear();
    liveUpdateInstance = null; //@TODO check is this need or not
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
              getScattersData(false, true).call();
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
            ANALYTICS_EVENT_KEYS[appName].table.archiveRunsBatch,
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
              getScattersData(false, true).call();
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
    initialize,
    getAppConfigData: getModelAppConfigData,
    getScattersData,
    abortRequest,
    setDefaultAppConfigData: setModelDefaultAppConfigData,
    updateModelData,
    onActivePointChange,
    onExportTableData,
    onBookmarkCreate: onModelBookmarkCreate,
    onBookmarkUpdate: onModelBookmarkUpdate,
    onNotificationAdd: onModelNotificationAdd,
    onNotificationDelete: onModelNotificationDelete,
    onResetConfigData: onModelResetConfigData,
    onRunsTagsChange: onModelRunsTagsChange,
    onSortChange,
    destroy,
    changeLiveUpdateConfig,
    archiveRuns,
    deleteRuns,
  };

  if (grouping) {
    Object.assign(methods, {
      onGroupingSelectChange: onModelGroupingSelectChange,
      onGroupingModeChange({
        groupName,
        value,
      }: IOnGroupingModeChangeParams): void {
        onGroupingModeChange({
          groupName,
          value,
          model,
          appName,
          updateModelData,
        });
      },
      onGroupingPaletteChange(index: number): void {
        onGroupingPaletteChange({ index, model, appName, updateModelData });
      },
      onGroupingReset(groupName: GroupNameEnum): void {
        onGroupingReset({ groupName, model, appName, updateModelData });
      },
      onGroupingApplyChange(groupName: GroupNameEnum): void {
        onGroupingApplyChange({
          groupName,
          model,
          appName,
          updateModelData,
        });
      },
      onGroupingPersistenceChange(groupName: GroupNameEnum): void {
        onGroupingPersistenceChange({
          groupName,
          model,
          appName,
          updateModelData,
        });
      },
      onShuffleChange(name: 'color' | 'stroke'): void {
        onShuffleChange({ name, model, updateModelData });
      },
    });
  }
  if (selectForm) {
    Object.assign(methods, {
      onSelectOptionsChange<D>(data: D & Partial<ISelectOption[]>): void {
        onSelectOptionsChange({ data, model });
      },
      onSelectRunQueryChange(query: string): void {
        onSelectRunQueryChange({ query, model });
      },
    });
  }
  if (components?.charts?.[0]) {
    Object.assign(methods, {
      onChangeTooltip(tooltip: Partial<ITooltip>): void {
        onChangeTooltip({
          tooltip,
          groupingNames: [GroupNameEnum.COLOR, GroupNameEnum.CHART],
          model,
          appName,
        });
      },
      onChangeTrendlineOptions(
        trendlineOptions: Partial<ITrendlineOptions>,
      ): void {
        onChangeTrendlineOptions({ trendlineOptions, model, appName });
      },
    });
  }
  if (components?.table) {
    Object.assign(methods, {
      onRowHeightChange(height: RowHeightSize): void {
        onRowHeightChange({ height, model, appName });
      },
      onTableRowHover(rowKey?: string): void {
        onTableRowHover({ rowKey, model });
      },
      onTableRowClick(rowKey?: string): void {
        onTableRowClick({ rowKey, model });
      },
      onSortFieldsChange(sortFields: [string, any][]): void {
        onSortFieldsChange({ sortFields, model, appName, updateModelData });
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
      onTableResizeModeChange(mode: ResizeModeEnum): void {
        onTableResizeModeChange({ mode, model, appName });
      },
      onTableDiffShow(): void {
        onTableDiffShow({ model, appName, updateModelData });
      },
      onTableResizeEnd(tableHeight: string): void {
        onTableResizeEnd({ tableHeight, model, appName });
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
      onParamVisibilityChange(metricsKeys: string[]): void {
        onParamVisibilityChange({
          metricsKeys,
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
      onRowsVisibilityChange(metricKeys: string[]): void {
        return onRowsVisibilityChange({
          metricKeys,
          model,
          appName,
          updateModelData,
        });
      },
    });
  }

  return methods;
}

export default getScattersModelMethods;
