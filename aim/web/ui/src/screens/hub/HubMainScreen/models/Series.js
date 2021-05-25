import { flattenObject, formatValue } from '../../../../utils';

export default class Series {
  constructor(run, metric, trace, isHidden) {
    this.run = {
      ...run,
      metricIsHidden: isHidden,
    };
    this.metric = metric;
    this.trace = trace;
  }

  get params() {
    return this.run?.params;
  }

  get experimentName() {
    return this.run?.experiment_name;
  }

  get runHash() {
    return this.run?.run_hash;
  }

  get metricInfo() {
    return this.metric;
  }

  get traceInfo() {
    return this.trace;
  }

  get maxStep() {
    return this.trace.data[this.trace.data.length - 1][1];
  }

  get maxEpoch() {
    return this.trace.data[this.trace.data.length - 1][2];
  }

  get maxTime() {
    return this.trace.data[this.trace.data.length - 1][3];
  }

  get minTime() {
    return this.trace.data[0][3];
  }

  getPoint = (index) => {
    if (index >= 0 && !!this.trace?.data && this.trace?.data?.length > index) {
      return this.trace.data[index];
    }
    return null;
  };

  getValue = (index) => {
    const point = this.getPoint(index);
    return point !== null ? point[0] : null;
  };

  getAggregatedMetricValue = (metric, context, agg = 'last') => {
    const runMetrics = this.run.params['__METRICS__'];
    if (!runMetrics || !(metric in runMetrics)) {
      return undefined;
    }

    const metricValues = runMetrics[metric];
    let lastValue = undefined;

    metricValues.forEach((metricContext) => {
      const metricContextDict = {};
      metricContext.context.forEach((contextItem) => {
        metricContextDict[contextItem[0]] = contextItem[1];
      });

      if (_.isEqual(metricContextDict, context)) {
        lastValue = metricContext.values[agg];
      }
    });

    return lastValue;
  };

  getParamsFlatDict = (
    includeMetrics = false,
    preserveDefaultNamespace = true,
    formatValues = true,
  ) => {
    // TODO: Implement caching
    let paramsNested = Object.assign({}, this.run.params);
    if (!includeMetrics && paramsNested.hasOwnProperty('__METRICS__')) {
      delete paramsNested['__METRICS__'];
    }
    if (!preserveDefaultNamespace && paramsNested.hasOwnProperty('default')) {
      paramsNested = Object.assign({}, paramsNested, paramsNested['default']);
      delete paramsNested['default'];
    }
    const flatParams = flattenObject(paramsNested);
    if (formatValues === true) {
      Object.keys(flatParams).forEach(
        (paramKey) =>
          (flatParams[paramKey] = formatValue(flatParams[paramKey])),
      );
    } else if (!!formatValues) {
      Object.keys(flatParams).forEach(
        (paramKey) =>
          (flatParams[paramKey] = formatValues(flatParams[paramKey])),
      );
    }
    return flatParams;
  };
}
