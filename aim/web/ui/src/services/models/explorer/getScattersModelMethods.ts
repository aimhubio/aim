import moment from 'moment';
import { saveAs } from 'file-saver';
import _ from 'lodash-es';

import { IPoint } from 'components/ScatterPlot';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import {
  getParamsTableColumns,
  paramsTableRowRenderer,
} from 'pages/Params/components/ParamsTableGrid/ParamsTableGrid';

import * as analytics from 'services/analytics';
import runsService from 'services/api/runs/runsService';
import LiveUpdateService from 'services/live-update/examples/LiveUpdateBridge.example';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  GroupNameType,
  IGroupingSelectOption,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  IPanelTooltip,
  ITooltipData,
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
  IAppModelConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';
import {
  IScatterAppModelState,
  ITrendlineOptions,
} from 'types/services/models/scatter/scatterAppModel';

import exceptionHandler from 'utils/app/exceptionHandler';
import getChartTitleData from 'utils/app/getChartTitleData';
import { getFilteredGroupingOptions } from 'utils/app/getFilteredGroupingOptions';
import getFilteredRow from 'utils/app/getFilteredRow';
import { getGroupingPersistIndex } from 'utils/app/getGroupingPersistIndex';
import getGroupingSelectOptions from 'utils/app/getGroupingSelectOptions';
import getRunData from 'utils/app/getRunData';
import getTooltipData from 'utils/app/getTooltipData';
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
import filterTooltipContent from 'utils/filterTooltipContent';
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
import { isSystemMetric } from 'utils/isSystemMetric';
import { getValue } from 'utils/helper';
import onRowSelect from 'utils/app/onRowSelect';
import { SortField } from 'utils/getSortedFields';
import onChangeTrendlineOptions from 'utils/app/onChangeTrendlineOptions';

export default function getScattersModelMethods({
  appName,
  model,
  grouping,
  components,
  selectForm,
  setModelDefaultAppConfigData,
  getModelAppConfigData,
  getConfig,
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
  let tooltipData: ITooltipData = {};
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
      tooltipData = {};
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
    const { data, params, highLevelParams, metricsColumns, selectedRows } =
      processData(rawData);

    const sortedParams = params.concat(highLevelParams).sort();
    const groupingSelectOptions = [
      ...getGroupingSelectOptions({
        params: sortedParams,
      }),
    ];

    tooltipData = getTooltipData({
      processedData: data,
      paramKeys: sortedParams,
      groupingSelectOptions,
      groupingItems: ['color', 'chart'],
      model,
    });

    const tableData = getDataAsTableRows(
      data,
      metricsColumns,
      params,
      false,
      configData,
      groupingSelectOptions,
    );
    const sortFields = model.getState()?.config?.table.sortFields;

    const tableColumns = getParamsTableColumns(
      groupingSelectOptions,
      metricsColumns,
      params,
      data[0]?.config,
      configData.table?.columnsOrder!,
      configData.table?.hiddenColumns!,
      sortFields,
      onSortChange,
      configData.grouping as any,
      onModelGroupingSelectChange,
    );

    if (!model.getState()?.requestIsPending) {
      model.getState()?.refs?.tableRef.current?.updateData({
        newData: tableData.rows,
        newColumns: tableColumns,
      });
    }

    model.setState({
      requestIsPending: false,
      data,
      chartData: getChartData(data),
      chartTitleData: getChartTitleData<IParam, IParamsAppModelState>({
        processedData: data,
        groupingSelectOptions,
        model: model as IModel<IParamsAppModelState>,
      }),
      params,
      metricsColumns,
      rawData,
      config: configData,
      tableData: tableData.rows,
      tableColumns,
      sameValueColumns: tableData.sameValueColumns,
      groupingSelectOptions,
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
                      values[i] = trace.last_value.last;
                      if (dimension[i]) {
                        dimension[i].values.push(trace.last_value.last);
                        if (typeof trace.last_value.last === 'string') {
                          dimension[i].scaleType = ScaleEnum.Point;
                          dimension[i].dimensionType = 'metric';
                        }
                      } else {
                        dimension[i] = {
                          values: [trace.last_value.last],
                          scaleType: ScaleEnum.Linear,
                          displayName: `${value.option_name} ${contextToString(
                            trace.context,
                          )}`,
                          dimensionType: 'metric',
                        };
                      }
                    }
                  });
                } else {
                  const paramValue = getValue(run.run.params, label);
                  values[i] = formatValue(paramValue, null);
                  if (values[i] !== null) {
                    if (typeof values[i] === 'string') {
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
            dimensions.push({
              scaleType: dimension.scaleType,
              domainData: _.isEmpty(dimension.values)
                ? ['-', '-']
                : [
                    Math.min(...(dimension.values as number[])),
                    Math.max(...(dimension.values as number[])),
                  ],
              displayName: dimension.displayName,
              dimensionType: dimension.dimensionType,
            });
          } else {
            dimensions.push({
              scaleType: dimension.scaleType,
              domainData: dimension.values,
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
    const rows: IMetricTableRowData[] | any =
      processedData[0]?.config !== null ? {} : [];

    let rowIndex = 0;
    const sameValueColumns: string[] = [];

    processedData.forEach((metricsCollection: IMetricsCollection<IParam>) => {
      const groupKey = metricsCollection.key;
      const columnsValues: { [key: string]: string[] } = {};

      if (metricsCollection.config !== null) {
        const groupConfigData: { [key: string]: string } = {};
        for (let key in metricsCollection.config) {
          groupConfigData[getValueByField(groupingSelectOptions, key)] =
            metricsCollection.config[key];
        }
        const groupHeaderRow = {
          meta: {
            chartIndex:
              config.grouping?.chart?.length! > 0 ||
              config.grouping?.reverseMode?.chart
                ? metricsCollection.chartIndex + 1
                : null,
            color: metricsCollection.color,
            dasharray: metricsCollection.dasharray,
            itemsCount: metricsCollection.data.length,
            config: groupConfigData,
          },
          key: groupKey!,
          groupRowsKeys: metricsCollection.data.map((metric) => metric.key),
          color: metricsCollection.color,
          dasharray: metricsCollection.dasharray,
          experiment: '',
          run: '',
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
          rowMeta: {
            color: metricsCollection.color ?? metric.color,
          },
          key: metric.key,
          selectKey: `${metric.run.hash}/${metric.key}`,
          runHash: metric.run.hash,
          isHidden: metric.isHidden,
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

        for (let key in metricsRowValues) {
          columnsValues[key] = ['-'];
        }

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
            isRowData
              ? rowValues
              : paramsTableRowRenderer(rowValues, {
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
              : paramsTableRowRenderer(rowValues, {
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
        if (columnsValues[columnKey].length === 1) {
          sameValueColumns.push(columnKey);
        }

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
          {},
          true,
          ['groups'].concat(Object.keys(columnsValues)),
        );
      }
    });
    return { rows, sameValueColumns };
  }

  function processData(data: IRun<IParamTrace>[]): {
    data: IMetricsCollection<IParam>[];
    params: string[];
    highLevelParams: string[];
    metricsColumns: any;
    selectedRows: any;
  } {
    const configData = model.getState()?.config;
    let selectedRows = model.getState()?.selectedRows;
    const grouping = configData?.grouping;
    let runs: IParam[] = [];
    let params: string[] = [];
    let highLevelParams: string[] = [];
    const paletteIndex: number = grouping?.paletteIndex || 0;
    const metricsColumns: any = {};

    data?.forEach((run: IRun<IParamTrace>, index) => {
      params = params.concat(getObjectPaths(run.params, run.params));
      highLevelParams = highLevelParams.concat(
        getObjectPaths(run.params, run.params, '', false, true),
      );
      run.traces.metric.forEach((trace) => {
        metricsColumns[trace.name] = {
          ...metricsColumns[trace.name],
          [contextToString(trace.context) as string]: '-',
        };
      });

      runs.push({
        run,
        isHidden: configData!.table.hiddenMetrics!.includes(run.hash),
        color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
        key: run.hash,
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
    const uniqParams = _.uniq(params);
    const uniqHighLevelParams = _.uniq(highLevelParams);
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
      highLevelParams: uniqHighLevelParams,
      metricsColumns,
      selectedRows,
    };
  }

  function groupData(data: IParam[]): IMetricsCollection<IParam>[] {
    const grouping = model.getState()!.config!.grouping;
    const { paletteIndex } = grouping;
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
    const { data, params, highLevelParams, metricsColumns, selectedRows } =
      processData(model.getState()?.rawData as IRun<IParamTrace>[]);
    const sortedParams = params.concat(highLevelParams).sort();
    const groupingSelectOptions = [
      ...getGroupingSelectOptions({
        params: sortedParams,
      }),
    ];
    tooltipData = getTooltipData({
      processedData: data,
      paramKeys: sortedParams,
      groupingSelectOptions,
      groupingItems: ['color', 'chart'],
      model,
    });
    const tableData = getDataAsTableRows(
      data,
      metricsColumns,
      params,
      false,
      configData,
      groupingSelectOptions,
    );
    const tableColumns = getParamsTableColumns(
      groupingSelectOptions,
      metricsColumns,
      params,
      data[0]?.config,
      configData.table?.columnsOrder!,
      configData.table?.hiddenColumns!,
      configData.table?.sortFields,
      onSortChange,
      configData.grouping as any,
      onModelGroupingSelectChange,
    );
    const tableRef: any = model.getState()?.refs?.tableRef;
    tableRef.current?.updateData({
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

    model.setState({
      requestIsPending: false,
    });

    onModelNotificationAdd({
      id: Date.now(),
      severity: 'info',
      message: 'Request has been cancelled',
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
    if (shouldUrlUpdate) {
      updateURL({ configData, appName });
    }
    runsRequestRef = runsService.getRunsData(configData?.select?.query);
    return {
      call: async () => {
        if (_.isEmpty(configData?.select?.options)) {
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
            requestIsPending: false,
            queryIsEmpty: true,
            selectedRows: shouldResetSelectedRows
              ? {}
              : model.getState()?.selectedRows,
            ...state,
          });
        } else {
          model.setState({
            requestIsPending: true,
            queryIsEmpty: false,
            selectedRows: shouldResetSelectedRows
              ? {}
              : model.getState()?.selectedRows,
          });
          liveUpdateInstance?.stop().then();
          try {
            const stream = await runsRequestRef.call((detail) =>
              exceptionHandler({ detail, model }),
            );
            const runData = await getRunData(stream);
            updateData(runData);

            liveUpdateInstance?.start({
              q: configData?.select?.query,
            });
          } catch (ex: Error | any) {
            if (ex.name === 'AbortError') {
              onNotificationAdd({
                notification: {
                  message: ex.message,
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
    const tableColumns: ITableColumn[] = getParamsTableColumns(
      groupingSelectOptions,
      metricsColumns,
      params,
      data[0]?.config,
      config.table?.columnsOrder!,
      config.table?.hiddenColumns!,
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
          const filteredRow = getFilteredRow<IMetricTableRowData>({
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
    saveAs(blob, `${appName}-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
    analytics.trackEvent(ANALYTICS_EVENT_KEYS[appName].table.exports.csv);
  }

  function onActivePointChange(
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ): void {
    const { refs, config } = model.getState();
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
          tooltip: {
            ...configData.chart.tooltip,
            content: filterTooltipContent(
              tooltipData[activePoint.key],
              configData?.chart.tooltip.selectedParams,
            ),
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

    model.setState({ config: configData });
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
                  message: `Runs are successfully ${
                    archived ? 'archived' : 'unarchived'
                  } `,
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
      onGroupingReset(groupName: GroupNameType): void {
        onGroupingReset({ groupName, model, appName, updateModelData });
      },
      onGroupingApplyChange(groupName: GroupNameType): void {
        onGroupingApplyChange({
          groupName,
          model,
          appName,
          updateModelData,
        });
      },
      onGroupingPersistenceChange(groupName: GroupNameType): void {
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
      onChangeTooltip(tooltip: Partial<IPanelTooltip>): void {
        onChangeTooltip({ tooltip, tooltipData, model, appName });
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
    });
  }

  return methods;
}
