import { deepEqual, formatValue, getValuesMedian } from '../../../../utils';
import Series from './Series';
import _ from 'lodash';

export default class Trace {
  constructor(config) {
    this.series = [];
    this.aggregation = {
      active: false,
      min: null,
      max: null,
      avg: null,
    };
    this.config = config;
    this.color = null;
    this.stroke = null;
    this.chart = null;
    this.experiments = [];
    this.metrics = [];
    this.contexts = [];
  }

  get seriesLength() {
    return this.series.length;
  }

  clone = () => {
    const traceClone = new Trace(this.config);

    traceClone.color = this.color;
    traceClone.stroke = this.stroke;
    traceClone.chart = this.chart;

    traceClone.series = this.series.slice();
    traceClone.aggregate();

    return traceClone;
  };

  addSeries = (series, aggregate = false, aggregatedLine, aggregatedArea) => {
    this.series.push(series);

    this.setExperiments(series.run.experiment_name);
    if (series.metric !== null) this.setMetrics(series.metric.name);
    if (series.trace !== null) this.setContexts(series.trace.context);

    if (aggregate) {
      this.aggregate(aggregatedLine, aggregatedArea);
    }
  };

  removeSeries = (index) => {
    this.series.splice(index, 1);
    this.aggregate();
  };

  aggregate = (aggregatedLine, aggregatedArea) => {
    if (
      aggregatedLine === 'min' ||
      aggregatedArea === 'min_max' ||
      aggregatedArea === 'none'
    ) {
      this.aggregation.min = this.aggregateSeries();
    }
    if (
      aggregatedLine === 'max' ||
      aggregatedArea === 'min_max' ||
      aggregatedArea === 'none'
    ) {
      this.aggregation.max = this.aggregateSeries();
    }
    if (aggregatedLine === 'avg') {
      this.aggregation.avg = this.aggregateSeries();
    } else if (aggregatedLine === 'median') {
      this.aggregation.med = this.aggregateSeries();
    }
    if (aggregatedArea === 'std_dev') {
      this.aggregation.stdDevMin = this.aggregateSeries();
      this.aggregation.stdDevMax = this.aggregateSeries();
    } else if (aggregatedArea === 'std_err') {
      this.aggregation.stdErrMin = this.aggregateSeries();
      this.aggregation.stdErrMax = this.aggregateSeries();
    } else if (aggregatedArea === 'conf_int') {
      this.aggregation.confIntMin = this.aggregateSeries();
      this.aggregation.confIntMax = this.aggregateSeries();
    }
  };

  aggregateSeries = () => {
    const trace = {
      data: [],
      num_steps: 0,
      context: null,
    };
    const metric = {
      name: null,
      traces: [trace],
    };
    const run = {
      experiment_name: null,
      run_hash: null,
      params: null,
      metrics: [metric],
    };

    // Aggregate params and configs
    const name = [];
    const experiment_name = [];
    const run_hash = [];
    const context = {};
    const params = {};
    this.series.forEach((s) => {
      experiment_name.push(s.run.experiment_name);
      run_hash.push(s.run.run_hash);
      if (s.metric !== null) name.push(s.metric.name);
      // FIXME: Use deepmerge to merge arrays as well
      if (!!s.run.params) {
        _.merge(params, s.run.params);
      }
      if (!!s.trace?.context) {
        _.merge(context, s.trace.context);
      }
    });
    run.params = params;
    trace.context = context;
    metric.name = _.uniq(name);
    run.run_hash = _.uniq(run_hash);
    run.experiment_name = _.uniq(experiment_name);

    if (trace.data.length) {
      trace.num_steps = trace.data[trace.data.length - 1][1];
    }

    return new Series(run, metric, trace);
  };

  matchConfig = (config) => {
    return deepEqual(config, this.config);
  };

  hasRunWithRunHash = (run_hash) => {
    for (let i = 0; i < this.series.length; i++) {
      let series = this.series[i];
      if (series?.run?.run_hash === run_hash) {
        return true;
      }
    }

    return false;
  };

  hasRun = (run_hash, metricName, traceContext) => {
    for (let i = 0; i < this.series.length; i++) {
      let series = this.series[i];
      if (
        series?.run?.run_hash === run_hash &&
        series?.metric?.name === metricName &&
        btoa(JSON.stringify(series?.trace?.context)).replace(
          /[\=\+\/]/g,
          '',
        ) === traceContext
      ) {
        return true;
      }
    }

    return false;
  };

  setExperiments = (experiment_name) => {
    if (!this.experiments.includes(experiment_name)) {
      this.experiments.push(experiment_name);
    }
  };

  setMetrics = (metric_name) => {
    if (!this.metrics.includes(metric_name)) {
      this.metrics.push(metric_name);
    }
  };

  setContexts = (context) => {
    if (!!context) {
      Object.keys(context).forEach((contextKey) => {
        let contextValue = `${contextKey}=${formatValue(context[contextKey])}`;
        if (!this.contexts.includes(contextValue)) {
          this.contexts.push(contextValue);
        }
      });
    }
  };

  getAggregatedMetricMinMax = (metric, context) => {
    let result = {
      min: undefined,
      avg: undefined,
      med: undefined,
      max: undefined,
    };
    let lastValuesSum;
    let values = [];
    this.series.forEach((series) => {
      let seriesMetricValue = series.getAggregatedMetricValue(metric, context);
      values.push(seriesMetricValue);
      if (result.min === undefined || seriesMetricValue < result.min) {
        result.min = seriesMetricValue;
      }
      if (result.max === undefined || seriesMetricValue > result.max) {
        result.max = seriesMetricValue;
      }
      if (seriesMetricValue !== undefined && seriesMetricValue !== null) {
        if (lastValuesSum === undefined) {
          lastValuesSum = seriesMetricValue;
        } else {
          lastValuesSum += seriesMetricValue;
        }
      }
    });
    result.avg =
      lastValuesSum === undefined
        ? undefined
        : lastValuesSum / this.series.length;
    result.med = getValuesMedian(values);
    return result;
  };
}
