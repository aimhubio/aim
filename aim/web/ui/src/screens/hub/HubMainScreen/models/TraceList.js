import _ from 'lodash';
import md5 from 'md5';

import Trace from './Trace';
import {
  deepEqual,
  getObjectValueByPath,
  arraysIntersection,
  getValuesMedian,
  calculateExponentianlMovingAvergae,
  calculateCentralMovingAverage,
} from '../../../../utils';
import { COLORS } from '../../../../constants/colors';
import { STROKES } from '../../../../constants/strokes';
import Series from './Series';

export default class TraceList {
  constructor(grouping = null) {
    this.traces = [];

    this.grouping = grouping;
    /*
      Example:
      {
        'color': ['params.hparams.learning_rate'],
        'stroke': ['params.hparams.batch_size'],
        'chart': ['params.hparams.learning_rate'],
      }
     */

    this.groupingFields = Object.values(this.grouping)
      .flat()
      .filter((v, i, self) => self.indexOf(v) === i);

    this.groupingConfigMap = {
      colors: [],
      strokes: [],
      charts: [],
    };
    /*
      Example:
      {
        colors: [
          {
            config: {
              'params.hparams.learning_rate': 0.01,
              'params.hparams.batch_size': 32,
            },
            value: '#AAA',
          }, {
            ...
          }
        ],
        strokes: [
          {
            config: {
              'params.hparams.learning_rate': 0.01,
              'params.hparams.batch_size': 32,
            },
            value: '2 2',
          }, {
            ...
          }
        ],
        charts: [
          {
            config: {
              'params.hparams.learning_rate': 0.01,
              'params.hparams.batch_size': 32,
            },
            value: 0,
          }, {
            ...
          }
        ],
      }
     */

    this.groups = {};
    /*
      Example:
      {
        'params.hparams.learning_rate': [
          {
            value: 0.01,
            group: {
              'params.hparams.batch_size': [
                {
                  value: 32,
                  group: {},
                }, {
                  value: 64,
                  group: {},
                },
              ],
            },
          }, {
            value: 0.001,
            group: {
              'params.hparams.batch_size': [
                {
                  value: 64,
                  group: {},
                }, {
                  value: 128,
                  group: {},
                },
              ],
            },
          },
        ],
      }
     */
  }

  addTrace = (trace) => {
    this.traces.push(trace);
  };

  getRunParam = (paramName, run, metric, trace) => {
    if (paramName === 'experiment') {
      return run.experiment_name;
    } else if (paramName === 'run.hash') {
      return run.run_hash;
    } else if (paramName === 'metric') {
      return metric !== null ? metric.name : undefined;
    } else if (paramName.startsWith('context.')) {
      const contextKey = paramName.substring(8);
      return trace !== null &&
        !!trace.context &&
        Object.keys(trace.context).indexOf(contextKey) !== -1
        ? trace.context[contextKey]
        : undefined;
    } else if (paramName.startsWith('params.')) {
      try {
        return getObjectValueByPath(run.params, paramName.substring(7));
      } catch (e) {
        return undefined;
      }
    } else {
      try {
        return getObjectValueByPath(run.params, paramName);
      } catch (e) {
        return undefined;
      }
    }
  };

  addSeries = (
    run,
    metric = null,
    trace = null,
    alignBy = 'step',
    aggregate = false,
    scale,
    persist,
    seed,
    colorPalette = 0,
    isHidden,
    smoothingAlgorithm,
    smoothFactor,
    aggregatedLine,
    aggregatedArea,
  ) => {
    let subGroup = this.groups;
    this.groupingFields.forEach((g) => {
      const groupVal = this.getRunParam(g, run, metric, trace);

      if (Object.keys(subGroup).indexOf(g) === -1) {
        subGroup[g] = [];
      }

      let valueExists = false;
      for (let i = 0; i < subGroup[g].length; i++) {
        if (subGroup[g][i].value === groupVal) {
          valueExists = true;
          subGroup = subGroup[g][i].group;
          break;
        }
      }

      if (!valueExists) {
        subGroup[g].push({
          value: groupVal,
          group: {},
        });
        subGroup = subGroup[g][subGroup[g].length - 1].group;
      }
    });

    const traceModelConfig = {};
    this.groupingFields.forEach((g) => {
      traceModelConfig[g] = this.getRunParam(g, run, metric, trace);
    });

    let traceModel = null;
    for (let t = 0; t < this.traces.length; t++) {
      if (this.traces[t].matchConfig(traceModelConfig)) {
        traceModel = this.traces[t];
      }
    }

    if (traceModel === null) {
      traceModel = new Trace(traceModelConfig);
      this.addTrace(traceModel);
    }

    // Apply coloring
    if ('color' in this.grouping) {
      let color = null;
      const modelColorConfigKeys = arraysIntersection(
        Object.keys(traceModelConfig),
        this.grouping.color,
      );
      const modelColorConfig = {};
      modelColorConfigKeys.forEach((k) => {
        modelColorConfig[k] = traceModelConfig[k];
      });
      this.groupingConfigMap.colors.forEach((colorGroup) => {
        if (color === null && deepEqual(colorGroup.config, modelColorConfig)) {
          color = colorGroup.value;
        }
      });
      if (color === null) {
        if (persist.color) {
          const configEntries = Object.keys(modelColorConfig)
            .sort()
            .map((key) => modelColorConfig[key]);
          const configHash = md5(JSON.stringify(configEntries));
          let index = BigInt(0);
          for (let i = 0; i < configHash.length; i++) {
            const charCode = configHash.charCodeAt(i);
            if (charCode > 47 && charCode < 58) {
              index += BigInt(
                (charCode - 48) * Math.ceil(Math.pow(16, i) / seed.color),
              );
            } else if (charCode > 96 && charCode < 103) {
              index += BigInt(
                (charCode - 87) * Math.ceil(Math.pow(16, i) / seed.color),
              );
            }
          }

          color =
            COLORS[colorPalette][
              Number(index % BigInt(COLORS[colorPalette].length))
            ];
        } else {
          const groupsCount = this.groupingConfigMap.colors?.length;
          color =
            COLORS[colorPalette][groupsCount % COLORS[colorPalette].length];
        }

        this.groupingConfigMap.colors.push({
          config: modelColorConfig,
          value: color,
        });
      }
      traceModel.color = color;
    }

    // Apply stroke styling
    if ('stroke' in this.grouping) {
      let stroke = null;
      const modelStrokeConfigKeys = arraysIntersection(
        Object.keys(traceModelConfig),
        this.grouping.stroke,
      );
      const modelStrokeConfig = {};
      modelStrokeConfigKeys.forEach((k) => {
        modelStrokeConfig[k] = traceModelConfig[k];
      });
      this.groupingConfigMap.strokes.forEach((strGroup) => {
        if (stroke === null && deepEqual(strGroup.config, modelStrokeConfig)) {
          stroke = strGroup.value;
        }
      });
      if (stroke === null) {
        if (persist.style) {
          const configEntries = Object.keys(modelStrokeConfig)
            .sort()
            .map((key) => modelStrokeConfig[key]);
          const configHash = md5(JSON.stringify(configEntries));
          let index = BigInt(0);
          for (let i = 0; i < configHash.length; i++) {
            const charCode = configHash.charCodeAt(i);
            if (charCode > 47 && charCode < 58) {
              index += BigInt(
                (charCode - 48) * Math.ceil(Math.pow(16, i) / seed.style),
              );
            } else if (charCode > 96 && charCode < 103) {
              index += BigInt(
                (charCode - 87) * Math.ceil(Math.pow(16, i) / seed.style),
              );
            }
          }

          stroke = STROKES[Number(index % BigInt(STROKES.length))];
        } else {
          const groupsCount = this.groupingConfigMap.strokes?.length;
          stroke = STROKES[groupsCount % STROKES.length];
        }

        this.groupingConfigMap.strokes.push({
          config: modelStrokeConfig,
          value: stroke,
        });
      }
      traceModel.stroke = stroke;
    }

    // Apply division to charts
    if ('chart' in this.grouping) {
      // FIXME: Remove code/logic duplication -> one function to handle color, stroke styling and chart division
      let chart = null;
      const modelChartConfigKeys = arraysIntersection(
        Object.keys(traceModelConfig),
        this.grouping.chart,
      );
      const modelChartConfig = {};
      modelChartConfigKeys.forEach((k) => {
        modelChartConfig[k] = traceModelConfig[k];
      });
      this.groupingConfigMap.charts.forEach((chartGroup) => {
        if (chart === null && deepEqual(chartGroup.config, modelChartConfig)) {
          chart = chartGroup.value;
        }
      });
      if (chart === null) {
        chart = this.groupingConfigMap.charts.length
          ? Math.max(
            ...this.groupingConfigMap.charts.map(
              (chartGroup) => chartGroup.value,
            ),
          ) + 1
          : 0;
        this.groupingConfigMap.charts.push({
          config: modelChartConfig,
          value: chart,
        });
      }
      traceModel.chart = chart;
    }

    let traceClone = _.cloneDeep(trace);

    if (traceClone !== null && !isHidden) {
      // Apply smoothing
      const data = traceClone.data.map((p) => p[0]);
      if ((smoothingAlgorithm || 'ema') === 'ema' && smoothFactor > 0) {
        const smoothedData = calculateExponentianlMovingAvergae(
          data,
          smoothFactor,
        );
        traceClone.data = traceClone.data.map((p, i) => {
          let [value, ...rest] = p;
          return [smoothedData[i], ...rest];
        });
      } else if (smoothingAlgorithm === 'cma' && smoothFactor > 1) {
        const smoothedData = calculateCentralMovingAverage(data, smoothFactor);
        traceClone.data = traceClone.data.map((p, i) => {
          let [value, ...rest] = p;
          return [smoothedData[i], ...rest];
        });
      }
    }
    // Add series to trace
    const seriesModel = new Series(run, metric, traceClone, isHidden);

    let alignment = alignBy;

    if (alignBy === 'epoch' && this.grouping.chart.includes('context.subset')) {
      alignment = 'step';
    }
    traceModel.addSeries(
      seriesModel,
      aggregate,
      aggregatedLine,
      aggregatedArea,
    );
    this.setAxisValues(
      alignBy,
      aggregate,
      scale,
      aggregatedLine,
      aggregatedArea,
    );
  };

  getChartsNumber = () => {
    return this.groupingConfigMap.charts.length;
  };

  setAxisValues = (
    alignBy,
    aggregate,
    scale,
    aggregatedLine,
    aggregatedArea,
  ) => {
    let chartSteps;
    switch (alignBy) {
      case 'step':
        chartSteps = {};
        this.traces.forEach((traceModel) => {
          if (!chartSteps.hasOwnProperty(traceModel.chart)) {
            chartSteps[traceModel.chart] = [];
          }
          traceModel.series.forEach((series) => {
            const { trace } = series;
            if (trace !== undefined && trace !== null) {
              trace.axisValues = [];
              trace.data.forEach((point) => {
                const step = point[1];
                if (!chartSteps[traceModel.chart].includes(step)) {
                  chartSteps[traceModel.chart].push(step);
                }
                trace.axisValues.push(step);
              });
            }
          });

          chartSteps[traceModel.chart].sort((a, b) => a - b);
        });

        this.chartSteps = chartSteps;
        break;
      case 'epoch':
        let epochSteps = {};
        chartSteps = {};
        this.traces.forEach((traceModel) => {
          if (!epochSteps.hasOwnProperty(traceModel.chart)) {
            epochSteps[traceModel.chart] = {};
          }
          if (!chartSteps.hasOwnProperty(traceModel.chart)) {
            chartSteps[traceModel.chart] = [];
          }
          traceModel.series.forEach((series) => {
            const { trace } = series;
            if (trace !== undefined && trace !== null) {
              trace.data.forEach((point) => {
                const epoch = point[2];
                if (!epochSteps[traceModel.chart].hasOwnProperty(epoch)) {
                  epochSteps[traceModel.chart][epoch] = [];
                }
              });
            }
          });
        });

        for (let chart in epochSteps) {
          const epochStepsInChart = Object.keys(epochSteps[chart]).sort(
            (a, b) => +a - +b,
          );
          epochStepsInChart.forEach((epoch, epochIndex) => {
            this.traces.forEach((traceModel) => {
              if (traceModel.chart === +chart) {
                traceModel.series.forEach((series) => {
                  const { trace } = series;
                  if (trace !== undefined && trace !== null) {
                    const stepsInEpoch = trace.data
                      .filter((point) => `${point[2]}` === epoch)
                      .map((point) => point[1]);
                    if (stepsInEpoch.length > epochSteps[chart][epoch].length) {
                      if (epoch !== 'null' && epochIndex > 0) {
                        const prevEpoch = epochStepsInChart[epochIndex - 1];
                        const prevEpochLastValue =
                          epochSteps[chart][prevEpoch][
                            epochSteps[chart][prevEpoch].length - 1
                          ];
                        if (prevEpochLastValue >= stepsInEpoch[0]) {
                          epochSteps[chart][epoch] = stepsInEpoch.map(
                            (step, i) => {
                              if (i === 0) {
                                return prevEpochLastValue + 1;
                              }
                              return (
                                prevEpochLastValue +
                                1 +
                                (step - stepsInEpoch[i - 1]) * i
                              );
                            },
                          );
                        } else {
                          epochSteps[chart][epoch] = stepsInEpoch;
                        }
                      } else {
                        epochSteps[chart][epoch] = stepsInEpoch;
                      }
                    }
                  }
                });
              }
            });
            chartSteps[chart] = chartSteps[chart].concat(
              epochSteps[chart][epoch],
            );
          });
          chartSteps[chart] = _.uniq(chartSteps[chart]).sort((a, b) => a - b);
        }

        this.epochSteps = epochSteps;
        this.chartSteps = chartSteps;

        this.traces.forEach((traceModel) => {
          traceModel.series.forEach((series) => {
            const { trace } = series;
            if (trace !== undefined && trace !== null) {
              trace.axisValues = [];
              for (let chart in epochSteps) {
                if (traceModel.chart === +chart) {
                  for (let epoch in epochSteps[chart]) {
                    const stepsInEpoch = trace.data
                      .filter((point) => `${point[2]}` === epoch)
                      .map((point) => point[1]);
                    if (stepsInEpoch.length > 0) {
                      trace.axisValues =
                        epoch === 'null'
                          ? stepsInEpoch
                          : trace.axisValues.concat(
                            epochSteps[chart][epoch].slice(
                              epochSteps[chart][epoch].length -
                                  stepsInEpoch.length,
                            ),
                          );
                    }
                  }
                }
              }
            }
          });
        });
        break;
      case 'relative_time':
        chartSteps = {};
        this.traces.forEach((traceModel) => {
          traceModel.series.forEach((series) => {
            const { trace } = series;
            if (trace !== undefined && trace !== null) {
              const timeSteps = {};
              trace.data.forEach((point) => {
                const time = point[3] ?? 0;
                if (timeSteps.hasOwnProperty(time)) {
                  timeSteps[time].push(point[1]);
                } else {
                  timeSteps[time] = [point[1]];
                }
                if (trace.firstDate === undefined || time < trace.firstDate) {
                  trace.firstDate = time;
                }
              });
              trace.timeSteps = timeSteps;
            }
          });
        });

        this.traces.forEach((traceModel) => {
          if (!chartSteps.hasOwnProperty(traceModel.chart)) {
            chartSteps[traceModel.chart] = [];
          }
          traceModel.series.forEach((series) => {
            const { trace } = series;
            if (trace !== undefined && trace !== null) {
              trace.axisValues = [];
              trace.data.forEach((point) => {
                const time = point[3] ?? 0;
                const relativeTime =
                  time -
                  trace.firstDate +
                  (trace.timeSteps[time].length > 1
                    ? (0.99 / (trace.timeSteps[time].length - 1)) *
                      trace.timeSteps[time].indexOf(point[1])
                    : 0);
                if (!chartSteps[traceModel.chart].includes(relativeTime)) {
                  chartSteps[traceModel.chart].push(relativeTime);
                }
                trace.axisValues.push(relativeTime);
              });
            }
          });

          chartSteps[traceModel.chart].sort((a, b) => a - b);
        });

        this.chartSteps = chartSteps;
        break;
      case 'absolute_time':
        chartSteps = {};
        this.traces.forEach((traceModel) => {
          if (!chartSteps.hasOwnProperty(traceModel.chart)) {
            chartSteps[traceModel.chart] = [];
          }
          traceModel.series.forEach((series) => {
            const { trace } = series;
            if (trace !== undefined && trace !== null) {
              trace.axisValues = [];
              trace.data.forEach((point) => {
                const time = point[3];
                if (!chartSteps[traceModel.chart].includes(time)) {
                  chartSteps[traceModel.chart].push(time);
                }
                trace.axisValues.push(time);
              });
            }
          });

          chartSteps[traceModel.chart].sort((a, b) => a - b);
        });

        this.chartSteps = chartSteps;
        break;
      default:
        chartSteps = {};
        this.traces.forEach((traceModel) => {
          if (!chartSteps.hasOwnProperty(traceModel.chart)) {
            chartSteps[traceModel.chart] = [];
          }
          traceModel.series.forEach((series) => {
            const { trace } = series;
            if (trace !== undefined && trace !== null) {
              trace.axisValues = [];
              trace.data = trace.data
                .filter((point) => point[4] !== null)
                .sort((a, b) => a[4] - b[4]);
              trace.data.forEach((point) => {
                const step = point[4];
                if (!chartSteps[traceModel.chart].includes(step)) {
                  chartSteps[traceModel.chart].push(step);
                }
                trace.axisValues.push(step);
              });
            }
          });

          chartSteps[traceModel.chart] = chartSteps[traceModel.chart].sort(
            (a, b) => a - b,
          );
        });

        this.chartSteps = chartSteps;
    }

    if (aggregate) {
      this.aggregate(scale, aggregatedLine, aggregatedArea);
    }
  };

  aggregate = (
    scale = { xScale: 0, yScale: 0 },
    aggregatedLine,
    aggregatedArea,
  ) => {
    this.traces.forEach((traceModel) => {
      const valuesByStep = {};
      const axisValues = this.chartSteps[traceModel.chart];
      traceModel.series.forEach((series) => {
        const { run, trace } = series;
        if (trace !== undefined && trace !== null && !run.metricIsHidden) {
          for (let i = 0; i < trace.axisValues.length - 1; i++) {
            const step = trace.axisValues[i];
            const point = trace.data[i];
            const nextStep = trace.axisValues[i + 1];
            const nextPoint = trace.data[i + 1];

            const stepsInBetween = nextStep - step;
            for (let value of axisValues.slice(
              axisValues.indexOf(step),
              axisValues.indexOf(nextStep) + 1,
            )) {
              let y;
              let x0 = value - step;
              let x2 = stepsInBetween;
              let point1 = point[0];
              let point2 = nextPoint[0];

              if (x0 === 0) {
                y = point1;
              } else if (x0 === x2) {
                y = point2;
              } else {
                if (scale.xScale === 1) {
                  x0 = Math.log(value) - Math.log(step);
                  x2 = Math.log(nextStep) - Math.log(step);
                }
                if (scale.yScale === 1) {
                  point1 = Math.log(point1);
                  point2 = Math.log(point2);
                }
                if (point1 > point2) {
                  y = point1 - ((point1 - point2) * x0) / x2;
                } else {
                  y = ((point2 - point1) * x0) / x2 + point1;
                }
                if (scale.yScale === 1) {
                  y = Math.exp(y);
                }
              }
              if (
                (scale.xScale === 0 ||
                  (value !== 0 && step !== 0 && nextStep !== 0)) &&
                (scale.yScale === 0 || y > 0)
              ) {
                if (valuesByStep.hasOwnProperty(value)) {
                  if (!valuesByStep[value].includes(y)) {
                    valuesByStep[value].push(y);
                  }
                } else {
                  valuesByStep[value] = [y];
                }
              }
            }
          }
        }
      });

      if (!!traceModel.aggregation) {
        const stepTicks = Object.keys(valuesByStep).sort((a, b) => a - b);
        if (
          aggregatedLine === 'min' ||
          aggregatedArea === 'min_max' ||
          aggregatedArea === 'none'
        ) {
          traceModel.aggregation.min.trace.data = stepTicks.map((step) => [
            _.min(valuesByStep[step]),
            +step,
          ]);
        }
        if (
          aggregatedLine === 'max' ||
          aggregatedArea === 'min_max' ||
          aggregatedArea === 'none'
        ) {
          traceModel.aggregation.max.trace.data = stepTicks.map((step) => [
            _.max(valuesByStep[step]),
            +step,
          ]);
        }
        if (aggregatedLine === 'avg') {
          traceModel.aggregation.avg.trace.data = stepTicks.map((step) => [
            _.sum(valuesByStep[step]) / valuesByStep[step].length,
            +step,
          ]);
        } else if (aggregatedLine === 'median') {
          traceModel.aggregation.med.trace.data = stepTicks.map((step) => [
            getValuesMedian(valuesByStep[step]),
            +step,
          ]);
        }

        if (
          aggregatedArea === 'std_dev' ||
          aggregatedArea === 'std_err' ||
          aggregatedArea === 'conf_int'
        ) {
          let setpValues = {};
          stepTicks.forEach((step) => {
            const avg = _.sum(valuesByStep[step]) / valuesByStep[step].length;
            const distancesFromAvg = valuesByStep[step].map((value) =>
              Math.pow(avg - value, 2),
            );
            const sum = _.sum(distancesFromAvg);
            const stdDevValue = Math.sqrt(
              sum / (valuesByStep[step].length - 1 || 1),
            );

            if (aggregatedArea === 'std_dev') {
              setpValues[step] = {
                min: avg - stdDevValue,
                max: avg + stdDevValue,
              };
            } else if (aggregatedArea === 'std_err') {
              const stdErrValue =
                stdDevValue / Math.sqrt(valuesByStep[step].length);
              setpValues[step] = {
                min: avg - stdErrValue,
                max: avg + stdErrValue,
              };
            } else if (aggregatedArea === 'conf_int') {
              const zValue = 1.96; // for 95% confidence level
              const CI =
                zValue * (stdDevValue / Math.sqrt(valuesByStep[step].length));
              setpValues[step] = {
                min: avg - CI,
                max: avg + CI,
              };
            }
          });

          if (aggregatedArea === 'std_dev') {
            traceModel.aggregation.stdDevMin.trace.data = stepTicks.map(
              (step) => [setpValues[step].min, +step],
            );
            traceModel.aggregation.stdDevMax.trace.data = stepTicks.map(
              (step) => [setpValues[step].max, +step],
            );
          } else if (aggregatedArea === 'std_err') {
            traceModel.aggregation.stdErrMin.trace.data = stepTicks.map(
              (step) => [setpValues[step].min, +step],
            );
            traceModel.aggregation.stdErrMax.trace.data = stepTicks.map(
              (step) => [setpValues[step].max, +step],
            );
          } else if (aggregatedArea === 'conf_int') {
            traceModel.aggregation.confIntMin.trace.data = stepTicks.map(
              (step) => [setpValues[step].min, +step],
            );
            traceModel.aggregation.confIntMax.trace.data = stepTicks.map(
              (step) => [setpValues[step].max, +step],
            );
          }
        }
      }
    });
  };
}
