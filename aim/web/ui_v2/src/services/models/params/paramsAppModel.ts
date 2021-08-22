import _ from 'lodash-es';

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
  GroupNameType,
  IGetGroupingPersistIndex,
  IMetricAppConfig,
  IMetricsCollection,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import { IRun, IParamTrace } from 'types/services/models/metrics/runModel';
import { IParam } from 'types/services/models/params/paramsAppModel';
import { IDimensionsType } from 'types/utils/d3/drawParallelAxes';

const model = createModel<Partial<any>>({});
let tooltipData: ITooltipData = {};

function getConfig() {
  return {
    grouping: {
      color: ['run.params.hparams.seed'],
      style: ['run.params.hparams.max_k'],
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
    },
    select: {
      params: [
        { key: 'hparams.align', type: 'params' },
        { key: 'dataset.preproc', type: 'params' },
        { key: 'loss_scale', type: 'metric' },
        { key: 'nll_loss', type: 'metric' },
      ],
      query: '',
    },
  };
}

function initialize() {
  model.init();
  model.setState({
    config: getConfig(),
  });
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
    params = params.concat(
      getObjectPaths(_.omit(run.params, 'experiment_name', 'status')),
    );

    runs.push({
      run,
      color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      key: encode({
        runHash: run.params.status.hash,
        metricName: run.params.dataset.preproc,
      }),
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
            [paramKey.replace('run.params.', '')]: _.get(param, paramKey),
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
            [paramKey]: _.get(param, `run.params.${paramKey}`),
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
  grouping: IMetricAppConfig['grouping'],
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

function getParamsData() {
  const { call, abort } = runsService.getRunsData();
  return {
    call: async () => {
      const stream = await call();
      let gen = adjustable_reader(stream);
      let buffer_pairs = decode_buffer_pairs(gen);
      let decodedPairs = decodePathsVals(buffer_pairs);
      let objects = iterFoldTree(decodedPairs, 1);

      const runData: IRun<IParamTrace>[] = [];
      for await (let [keys, val] of objects) {
        runData.push(val as any);
      }
      const { data, params } = processData(runData);
      model.setState({
        data,
        highPlotData: getDataAsLines(data),
        params,
      });
    },
    abort,
  };
}

function getDataAsLines(
  processedData: IMetricsCollection<IParam>[],
  configData: any = model.getState()?.config,
): { dimensions: IDimensionsType; data: any }[] {
  if (!processedData) {
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
          ({ type, key }: { type: string; key: string }) => {
            const dimension = dimensionsObject[chartIndex];
            if (!dimension[key] && type === 'params') {
              dimension[key] = {
                values: new Set(),
                scaleType: 'linear',
                displayName: `<p>${key}</p>`,
              };
            }
            if (type === 'metric') {
              run.run.traces.forEach((trace: IParamTrace) => {
                const formattedContext = `${key}-${contextToString(
                  trace.context,
                )}`;
                if (trace.metric_name === key) {
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
                      displayName: `<p>${key}</p><p>${contextToString(
                        trace.context,
                      )}</p>`,
                    };
                  }
                }
              });
            } else {
              const value = _.get(run.run.params, key);
              if (value === undefined) {
                values[key] = null;
              } else if (value === null) {
                values[key] = 'None';
              } else if (typeof value === 'string') {
                values[key] = `"${value}"`;
              } else {
                // TODO need to fix type
                values[key] = value as any;
              }
              if (values[key] !== null) {
                if (typeof values[key] === 'string') {
                  dimension[key].scaleType = 'point';
                }
                dimension[key].values.add(values[key]);
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
        };
      } else {
        dimensions[key] = {
          scaleType: dimensionsObject[keyOfDimension][key].scaleType,
          domainData: [...dimensionsObject[keyOfDimension][key].values],
          displayName: dimensionsObject[keyOfDimension][key].displayName,
        };
      }
    });
    return {
      dimensions,
      data: groupedByChartIndex[i],
    };
  });
}

function onColorIndicatorChange(): void {
  const configData: any = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.isVisibleColorIndicator =
      !configData.chart.isVisibleColorIndicator;
    model.setState({ config: configData });
  }
}

function onCurveInterpolationChange(): void {
  const configData: any = model.getState()?.config;
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
  const configData: any = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.focusedState = {
      active: !!focusedStateActive,
      key: activePoint.key,
      xValue: activePoint.xValue,
      yValue: activePoint.yValue,
      chartIndex: activePoint.chartIndex,
    };
    model.setState({
      config: configData,
      tooltipContent: tooltipData[activePoint.key] || {},
    });
  }
}

const paramsAppModel = {
  ...model,
  initialize,
  getParamsData,
  onColorIndicatorChange,
  onCurveInterpolationChange,
  onActivePointChange,
};

export default paramsAppModel;
