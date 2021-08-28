import _, { isEmpty } from 'lodash-es';

import runsService from 'services/api/runs/runsService';
import createModel from '../model';
import { encode } from 'utils/encoder/encoder';
import getObjectPaths from 'utils/getObjectPaths';
import contextToString from 'utils/contextToString';
import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';

// Types
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum } from 'utils/d3';
import {
  IGroupingSelectOption,
  GroupNameType,
  IAppData,
  IDashboardData,
  IGetGroupingPersistIndex,
  IMetricAppConfig,
  IMetricsCollection,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ITooltipData,
  IChartTooltip,
} from 'types/services/models/metrics/metricsAppModel';
import { IRun, IParamTrace } from 'types/services/models/metrics/runModel';
import {
  IParam,
  IParamsAppConfig,
} from 'types/services/models/params/paramsAppModel';
import { IDimensionsType } from 'types/utils/d3/drawParallelAxes';
import { ISelectParamsOption } from 'types/pages/params/components/SelectForm/SelectForm';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';
import { IBookmarkFormState } from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import filterTooltipContent from 'utils/filterTooltipContent';

const model = createModel<Partial<any>>({});
let tooltipData: ITooltipData = {};

function getConfig() {
  return {
    grouping: {
      color: [],
      style: [],
      chart: [],
      // TODO refactor boolean value types objects into one
      reverseMode: {
        color: false,
        style: false,
        chart: false,
      },
      isApplied: {
        color: true,
        style: true,
        chart: true,
      },
      persistence: {
        color: false,
        style: false,
      },
      seed: {
        color: 10,
        style: 10,
      },
      paletteIndex: 0,
      selectOptions: [],
    },
    chart: {
      curveInterpolation: CurveEnum.Linear,
      isVisibleColorIndicator: false,
      focusedState: {
        key: null,
        xValue: null,
        yValue: null,
        active: false,
        chartIndex: null,
      },
      tooltip: {
        content: {},
        display: true,
        selectedParams: [],
      },
    },
    select: {
      params: [],
      query: '',
    },
  };
}

let getRunsRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

function initialize() {
  model.init();
  model.setState({
    config: getConfig(),
  });
}

function getParamsData() {
  return {
    call: async () => {
      const select = model.getState()?.config?.select;
      getRunsRequestRef = runsService.getRunsData(select?.query);
      if (!isEmpty(select?.params)) {
        const stream = await getRunsRequestRef.call();
        let gen = adjustable_reader(stream);
        let buffer_pairs = decode_buffer_pairs(gen);
        let decodedPairs = decodePathsVals(buffer_pairs);
        let objects = iterFoldTree(decodedPairs, 1);

        const runData: IRun<IParamTrace>[] = [];
        for await (let [keys, val] of objects) {
          runData.push({ ...(val as any), hash: keys[0] });
        }
        const { data, params } = processData(runData);
        const configData = model.getState()?.config;
        if (configData) {
          configData.grouping.selectOptions = [
            ...getGroupingSelectOptions(params),
          ];
        }

        model.setState({
          data,
          highPlotData: getDataAsLines(data),
          params,
          rawData: runData,
          config: configData,
        });
      }
    },
    abort: () => getRunsRequestRef.abort(),
  };
}

function processData(data: IRun<IParamTrace>[]): {
  data: IMetricsCollection<IParam>[];
  params: string[];
} {
  const grouping = model.getState()?.config?.grouping;
  let runs: IParam[] = [];
  let params: string[] = [];
  const paletteIndex: number = grouping?.paletteIndex || 0;
  data.forEach((run: IRun<IParamTrace>, index) => {
    params = params.concat(getObjectPaths(run.params, run.params));

    runs.push({
      run,
      color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      key: run.hash,
      dasharray: DASH_ARRAYS[0],
    });
  });
  const processedData = groupData(runs);
  const uniqParams = _.uniq(params);

  setTooltipData(processedData, uniqParams);

  return {
    data: processedData,
    params: uniqParams,
  };
}

function getDataAsLines(
  processedData: IMetricsCollection<IParam>[],
  configData: any = model.getState()?.config,
): { dimensions: IDimensionsType; data: any }[] {
  if (!processedData || _.isEmpty(configData.select.params)) {
    return [];
  }
  const dimensionsObject: any = {};
  const lines = processedData.map(
    ({ chartIndex, color, data, dasharray }: IMetricsCollection<IParam>) => {
      if (!dimensionsObject[chartIndex]) {
        dimensionsObject[chartIndex] = {};
      }

      return data.map((run: IParam) => {
        const values: { [key: string]: string | number | null } = {};
        configData.select.params.forEach(
          ({ type, label, value }: ISelectParamsOption) => {
            const dimension = dimensionsObject[chartIndex];
            if (!dimension[label] && type === 'params') {
              dimension[label] = {
                values: new Set(),
                scaleType: 'linear',
                displayName: `<span>${label}</span>`,
                dimensionType: 'param',
              };
            }
            if (type === 'metrics') {
              run.run.traces.forEach((trace: IParamTrace) => {
                const formattedContext = `${
                  value?.param_name
                }-${contextToString(trace.context)}`;
                if (
                  trace.metric_name === value?.param_name &&
                  _.isEqual(trace.context, value?.context)
                ) {
                  values[formattedContext] = trace.last_value.last;
                  if (dimension[formattedContext]) {
                    dimension[formattedContext].values.add(
                      trace.last_value.last,
                    );
                    if (typeof trace.last_value.last === 'string') {
                      dimension[formattedContext].scaleType = 'point';
                    }
                  } else {
                    dimension[formattedContext] = {
                      values: new Set().add(trace.last_value.last),
                      scaleType: 'linear',
                      displayName: `<span>${
                        value.param_name
                      }</span><span>${contextToString(trace.context)}</span>`,
                      dimensionType: 'metric',
                    };
                  }
                }
              });
            } else {
              const paramValue = _.get(run.run.params, label);
              if (paramValue === undefined) {
                values[label] = null;
              } else if (paramValue === null) {
                values[label] = 'None';
              } else if (typeof paramValue === 'string') {
                values[label] = `"${paramValue}"`;
              } else {
                // TODO need to fix type
                values[label] = paramValue as any;
              }
              if (values[label] !== null) {
                if (typeof values[label] === 'string') {
                  dimension[label].scaleType = 'point';
                }
                dimension[label].values.add(values[label]);
              }
            }
          },
        );
        return {
          values,
          color: color ?? run.color,
          dasharray: dasharray ?? run.dasharray,
          chartIndex: chartIndex,
          key: run.key,
        };
      });
    },
  );

  const flattedLines = lines.flat();
  const groupedByChartIndex = Object.values(
    _.groupBy(flattedLines, 'chartIndex'),
  );

  return Object.keys(dimensionsObject).map((keyOfDimension, i) => {
    const dimensions: IDimensionsType = {};
    Object.keys(dimensionsObject[keyOfDimension]).forEach((key: string) => {
      if (dimensionsObject[keyOfDimension][key].scaleType === 'linear') {
        dimensions[key] = {
          scaleType: dimensionsObject[keyOfDimension][key].scaleType,
          domainData: [
            Math.min(...dimensionsObject[keyOfDimension][key].values),
            Math.max(...dimensionsObject[keyOfDimension][key].values),
          ],
          displayName: dimensionsObject[keyOfDimension][key].displayName,
          dimensionType: dimensionsObject[keyOfDimension][key].dimensionType,
        };
      } else {
        dimensions[key] = {
          scaleType: dimensionsObject[keyOfDimension][key].scaleType,
          domainData: [...dimensionsObject[keyOfDimension][key].values],
          displayName: dimensionsObject[keyOfDimension][key].displayName,
          dimensionType: dimensionsObject[keyOfDimension][key].dimensionType,
        };
      }
    });
    return {
      dimensions,
      data: groupedByChartIndex[i],
    };
  });
}

function setTooltipData(
  processedData: IMetricsCollection<IParam>[],
  paramKeys: string[],
): void {
  const data: { [key: string]: any } = {};

  function getGroupConfig(param: IParam) {
    const configData = model.getState()?.config;
    const groupingItems: GroupNameType[] = ['color', 'style', 'chart'];
    let groupConfig: { [key: string]: {} } = {};
    for (let groupItemKey of groupingItems) {
      const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
      if (groupItem.length) {
        groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey.replace('run.params.', '')]: JSON.stringify(
              _.get(param, paramKey, '-'),
            ),
          });
          return acc;
        }, {});
      }
    }
    return groupConfig;
  }

  for (let metricsCollection of processedData) {
    for (let param of metricsCollection.data) {
      data[param.key] = {
        group_config: getGroupConfig(param),
        params: paramKeys.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey]: JSON.stringify(
              _.get(param, `run.params.${paramKey}`, '-'),
            ),
          });
          return acc;
        }, {}),
      };
    }
  }

  tooltipData = data;
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

function getFilteredGroupingOptions(
  grouping: IParamsAppConfig['grouping'],
  groupName: GroupNameType,
): string[] {
  const { selectOptions, reverseMode, isApplied } = grouping;

  const filteredOptions = [...selectOptions]
    .filter((opt) => grouping[groupName].indexOf(opt.value) === -1)
    .map((item) => item.value);
  return isApplied[groupName]
    ? reverseMode[groupName]
      ? filteredOptions
      : grouping[groupName]
    : [];
}

function groupData(data: IParam[]): IMetricsCollection<IParam>[] {
  const grouping = model.getState()!.config!.grouping;
  const { paletteIndex } = grouping;
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStyle = getFilteredGroupingOptions(grouping, 'style');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
  if (
    groupByColor.length === 0 &&
    groupByStyle.length === 0 &&
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
    [key: string]: IMetricsCollection<IParam> | any;
  } = {};

  const groupingFields = _.uniq(
    groupByColor.concat(groupByStyle).concat(groupByChart),
  );

  for (let i = 0; i < data.length; i++) {
    const groupValue: { [key: string]: unknown } = {};
    groupingFields.forEach((field) => {
      groupValue[field] = _.get(data[i], field);
    });
    const groupKey = encode(groupValue);
    if (groupValues.hasOwnProperty(groupKey)) {
      groupValues[groupKey].data.push(data[i]);
    } else {
      groupValues[groupKey] = {
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

    if (groupByStyle.length > 0) {
      const dasharrayConfig = _.pick(groupValue.config, groupByStyle);
      const dasharrayKey = encode(dasharrayConfig);
      if (grouping.persistence.style && grouping.isApplied.style) {
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
  return Object.values(groupValues);
}

function onColorIndicatorChange(): void {
  const configData: IParamsAppConfig = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.isVisibleColorIndicator =
      !configData.chart.isVisibleColorIndicator;
    model.setState({ config: configData });
  }
}

function onCurveInterpolationChange(): void {
  const configData: IParamsAppConfig = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.curveInterpolation =
      configData.chart.curveInterpolation === CurveEnum.Linear
        ? CurveEnum.MonotoneX
        : CurveEnum.Linear;
    model.setState({ config: configData });
  }
}

function onActivePointChange(
  activePoint: IActivePoint,
  focusedStateActive: boolean = false,
): void {
  const configData: IParamsAppConfig = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.focusedState = {
      active: !!focusedStateActive,
      key: activePoint.key,
      xValue: activePoint.xValue,
      yValue: activePoint.yValue,
      chartIndex: activePoint.chartIndex,
    };
    configData.chart.tooltip = {
      ...configData.chart.tooltip,
      content: filterTooltipContent(
        tooltipData[activePoint.key],
        configData?.chart.tooltip.selectedParams,
      ),
    };

    model.setState({
      config: configData,
    });
  }
}

function onParamsSelectChange(data: any[]) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: { ...configData.select, params: data },
      },
    });
  }
}

function onSelectRunQueryChange(query: string) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: { ...configData.select, query },
      },
    });
  }
}

function getGroupingSelectOptions(params: string[]): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params.map((param) => ({
    value: `run.params.${param}`,
    group: 'params',
    label: param,
  }));

  return [
    ...paramsOptions,
    {
      group: 'Other',
      label: 'experiment_name',
      value: 'run.experiment_name',
    },
    {
      group: 'Other',
      label: 'run.hash',
      value: 'run.params.status.hash',
    },
    {
      group: 'Other',
      label: 'metric_name',
      value: 'metric_name',
    },
    {
      group: 'context',
      label: 'subset',
      value: 'context.subset',
    },
  ];
}

function onGroupingSelectChange({
  groupName,
  list,
}: IOnGroupingSelectChangeParams) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    updateModelData(configData);
  }
}

function onGroupingModeChange({
  groupName,
  value,
}: IOnGroupingModeChangeParams): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      [groupName]: value,
    };
    updateModelData(configData);
  }
}

function onGroupingPaletteChange(index: number): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      paletteIndex: index,
    };
    updateModelData(configData);
  }
}

function onGroupingReset(groupName: GroupNameType) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    const { reverseMode, paletteIndex, isApplied, persistence } =
      configData.grouping;
    configData.grouping = {
      ...configData.grouping,
      reverseMode: { ...reverseMode, [groupName]: false },
      [groupName]: [],
      paletteIndex: groupName === 'color' ? 0 : paletteIndex,
      persistence: { ...persistence, [groupName]: false },
      isApplied: { ...isApplied, [groupName]: true },
    };
    updateModelData(configData);
  }
}

function updateModelData(configData: IParamsAppConfig): void {
  const processedData = processData(
    model.getState()?.rawData as IRun<IParamTrace>[],
  );
  model.setState({
    config: configData,
    data: processedData.data,
    highPlotData: getDataAsLines(processedData.data),
    // tableData: getDataAsTableRows(
    //   processedData.data,
    //   null,
    //   processedData.params,
    // ),
  });
}

function onGroupingApplyChange(groupName: GroupNameType): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      isApplied: {
        ...configData.grouping.isApplied,
        [groupName]: !configData.grouping.isApplied[groupName],
      },
    };
    updateModelData(configData);
  }
}

function onGroupingPersistenceChange(groupName: 'style' | 'color'): void {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      persistence: {
        ...configData.grouping.persistence,
        [groupName]: !configData.grouping.persistence[groupName],
      },
    };
    updateModelData(configData);
  }
}
async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    const data: IAppData | any = await appsService.createApp(configData).call();
    if (data.id) {
      dashboardService
        .createDashboard({ app_id: data.id, name, description })
        .call()
        .then((res: IDashboardData | any) => {
          if (res.id) {
            onNotificationAdd({
              id: Date.now(),
              severity: 'success',
              message: BookmarkNotificationsEnum.CREATE,
            });
          }
        })
        .catch((err) => {
          onNotificationAdd({
            id: Date.now(),
            severity: 'error',
            message: BookmarkNotificationsEnum.ERROR,
          });
        });
    }
  }
}

function onBookmarkUpdate(id: string) {
  const configData: IParamsAppConfig | undefined = model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, configData)
      .call()
      .then((res: IDashboardData | any) => {
        if (res.id) {
          onNotificationAdd({
            id: Date.now(),
            severity: 'success',
            message: BookmarkNotificationsEnum.UPDATE,
          });
        }
      });
  }
}

function onChangeTooltip(tooltip: Partial<IChartTooltip>): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    let content = configData.chart.tooltip.content;
    if (tooltip.selectedParams && configData?.chart.focusedState.key) {
      content = filterTooltipContent(
        tooltipData[configData.chart.focusedState.key],
        tooltip.selectedParams,
      );
    }
    configData.chart.tooltip = {
      ...configData.chart.tooltip,
      ...tooltip,
      content,
    };

    model.setState({ config: configData });
  }
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

function onResetConfigData(): void {
  model.setState({
    config: getConfig(),
  });
}
const paramsAppModel = {
  ...model,
  initialize,
  getParamsData,
  onColorIndicatorChange,
  onCurveInterpolationChange,
  onActivePointChange,
  onParamsSelectChange,
  onSelectRunQueryChange,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
  onNotificationAdd,
  onNotificationDelete,
  onChangeTooltip,
};

export default paramsAppModel;
