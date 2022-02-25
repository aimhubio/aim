## Explorers

### Overview

Aim enables powerful UI to explore logged ML runs and metadata.

### Metrics explorer

Metrics explorer helps you to compare 500s of metrics within a few clicks.
You can simply group, filter and compare your tracked metrics with Metrics Explorer.
It helps to save lots of time compared to other open-source experiment tracking tools.

Metrics Explorer main parts are:
- Select Form
- Charts
- Table
- Grouping

Features:
- Easily query any metric
- Group by any parameter
- Divide into subplots
- Chart controls:
    - [Aggregate grouped metrics](#aggregate-metrics)
    - [Align metrics by time, epoch or custom metric](#x-axis-properties)
    - [Change scale of the axes (linear or log)](#axes-scale)
    - [Apply smoothing](#chart-smoothing)
    - [Ignore outliers](#ignore-outliers)
    - [Apply highlighting modes (metric on hover, run on hover)](#highlight-modes)
    - Set chart tooltip parameters
    - Apply zoom in/out on charts
    - Export chart as image

<img src="../../_static/images/ui/overview/metrics_explorer.png" style="border: 1px solid #1d2253" alt="metrics_explorer" />

#### Aggregate metrics

When in aggregation mode, a chart shows the aggregated (composed) values instead of the individual values.
This type of display is useful if you want to present summarized results in charts.

##### Aggregation Line:

Following types of aggregation line are available: [Mean](#mean), [Median](#median), [Min](#min), and [Max](#max).
By default, aggregation line is the [Mean](#mean).

###### Mean

By selecting aggregation line Mean, will represent [Arithmetic mean](https://en.wikipedia.org/wiki/Arithmetic_mean) of the tracked metrics: 
the sum of a collection of numbers divided by the count of numbers in the collection.

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_line_mean.png" style="border: 1px solid #1d2253" alt="aggr_line_mean" />

###### Median

By selecting aggregation line Median, will represent [The Median](https://en.wikipedia.org/wiki/Median) of the tracked metrics:
the "middle" number of a finite list of numbers, when those numbers are listed in order from smallest to greatest.

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_line_median.png" style="border: 1px solid #1d2253" alt="aggr_line_median" />

###### Min

By selecting aggregation line Min, will represent minimum tracked metrics values per X.

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_line_min.png" style="border: 1px solid #1d2253" alt="aggr_line_min" />

###### Max

By selecting aggregation line Max, will represent maximum tracked metrics values per X.

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_line_max.png" style="border: 1px solid #1d2253" alt="aggr_line_max" />

##### Aggregation Area:

Following types of aggregation area are available: [None](#none), [Min/Max](#min-and-max), [Mean ± Standard Deviation](#standard-deviation), [Mean ± Standard Error](#standard-error), and [Confidence Interval (95%)](#confidence-interval).
By default, aggregate area is the [Min/Max](#min-and-max).

###### None

By selecting aggregation area None, will remove aggregated area from chart.

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_area_none.png" style="border: 1px solid #1d2253" alt="aggr_area_none" />

###### Min and Max

By selecting aggregation area Min/Max, will draw area between minimum and maximum of tracked metrics per X.

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_area_min_max.png" style="border: 1px solid #1d2253" alt="aggr_area_min_max"/>

###### Standard Deviation

By selecting aggregation area Mean ± Standard Deviation, will draw area between `mean - standard deviation` and `mean + standard deviation` of tracked metrics per X.

[Mean](#mean), [Standard Deviation](https://en.wikipedia.org/wiki/Standard_deviation)

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_area_std_dev.png" style="border: 1px solid #1d2253" alt="aggr_area_std_dev"/> 

###### Standard Error

By selecting aggregation area Mean ± Standard Error, will draw area between  `mean - standard error` and `mean + standard error` of tracked metrics per X.

[Mean](#mean), [Standard Error](https://en.wikipedia.org/wiki/Standard_error)

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_area_std_err.png" style="border: 1px solid #1d2253" alt="aggr_area_std_err"/> 

###### Confidence Interval

By selecting aggregation area Mean ± Confidence Interval, will draw area between `mean - confidence interval` and `mean + confidence interval` of tracked metrics per X.

[Mean](#mean), [Confidence Interval](https://en.wikipedia.org/wiki/Confidence_interval)

  <img src="../../_static/images/ui/overview/metrics/aggregation/aggr_area_conf_int.png" style="border: 1px solid #1d2253" alt="aggr_area_conf_int"/> 

#### X-Axis properties

X-Axis properties section is for controlling density of metrics x-axis values and aligning metrics by time, epoch or another metric.

##### Density:

Following types of metrics density are available: [Minimum](#minimum), [Medium](#medium), [Maximum](#maximum).
By default, metrics density is the [Maximum](#maximum).

###### Minimum

By setting metrics density to Minimum, will query metrics by 50 point.

###### Medium

By setting metrics density to Medium, will query metrics by 250 point.

###### Maximum

By setting metrics density to Maximum, will query metrics by 500 point.

##### Alignment:

Following types of metrics alignment are available: [Step](#step), [Epoch](#epoch), [Relative Time](#relative-time), [Absolute Time](#absolute-time) and [Custom Metric](#custom-metric).
By default, metrics aligned by [Step](#step).

###### Step

By setting metrics alignment to Step, x-axis values will represent the steps of tracked metrics.

  <img src="../../_static/images/ui/overview/metrics/x-axis_properties/alignment_step.png" style="border: 1px solid #1d2253" alt="alignment_step" />

###### Epoch

By setting metrics alignment to Epoch, x-axis values will represent the epochs of tracked metrics.

  <img src="../../_static/images/ui/overview/metrics/x-axis_properties/alignment_epoch.png" style="border: 1px solid #1d2253" alt="alignment_epoch" />

###### Relative Time

By setting metrics alignment to Relative Time, x-axis values will represent by `HH:mm:ss`, duration of tracking process.

  <img src="../../_static/images/ui/overview/metrics/x-axis_properties/alignment_relative.png" style="border: 1px solid #1d2253" alt="alignment_relative" />

###### Absolute Time

By setting metrics alignment to Absolute Time, x-axis values will represent by date `HH:mm:ss D MMM, YY`, since the start date of the first run until the last run.

  <img src="../../_static/images/ui/overview/metrics/x-axis_properties/alignment_absolute.png" style="border: 1px solid #1d2253" alt="alignment_absolute" />

###### Custom Metric

By setting metrics alignment to Custom Metric, x-axis values will represent selected metric values, you can detect correlations between queried metrics and selected metric.

#### Axes Scale

Axes Scale section gives ability to display axes scale's [linear](https://en.wikipedia.org/wiki/Linear_scale) or [logarithmic](https://en.wikipedia.org/wiki/Logarithmic_scale).

By default, axes scale's are [Linear](#linear-scale).

##### Linear Scale

  <img src="../../_static/images/ui/overview/metrics/axes-scale/axes_scale_linear.png" style="border: 1px solid #1d2253" alt="axes_scale_linear" />

##### X-axis scale: Linear, Y-axis scale: Log

  <img src="../../_static/images/ui/overview/metrics/axes-scale/y-axis-scale-log.png" style="border: 1px solid #1d2253" alt="y-axis-scale-log" />

##### X-axis scale: Log, Y-axis scale: Linear  

  <img src="../../_static/images/ui/overview/metrics/axes-scale/x-axis-scale-log.png" style="border: 1px solid #1d2253" alt="x-axis-scale-log" />

##### Log Scale

  <img src="../../_static/images/ui/overview/metrics/axes-scale/axes-scale-log.png" style="border: 1px solid #1d2253" alt="axes-scale-log" />

#### Chart Smoothing

While smoothing the chart, the data points are modified so individual points higher than the adjacent points (presumably because of noise) are reduced, and points that are lower than the adjacent points are increased leading to a smoother signal.
You can select curve interpolation methods: Linear or Cubic.
By default, chart smoothing in [Exponential moving average](#exponential-moving-average) mode and curve interpolation method is Linear.

##### Exponential moving average

An [exponential moving average](https://en.wikipedia.org/wiki/Moving_average), also known as an exponentially weighted moving average (EWMA), 
is a first-order infinite impulse response filter that applies weighting factors which decrease exponentially.

  <img src="../../_static/images/ui/overview/metrics/chart-smoothing/smoothing_ema.png" style="border: 1px solid #1d2253" alt="smoothing_ema" />

##### Centered moving average

When you center the moving averages, the data points are placed at the center of the range rather than the end of it. 
This is done to position the moving average values at their central positions in time.

  <img src="../../_static/images/ui/overview/metrics/chart-smoothing/smoothing_cma.png" style="border: 1px solid #1d2253" alt="smoothing_cma" />

#### Ignore outliers

An outlier is an observation that lies an abnormal distance from other values in a random sample from a population.
Examination of the data for unusual observations that are far removed from the mass of data. 
These points are often referred to as outliers.

  <img src="../../_static/images/ui/overview/metrics/ignore-outliers/ignore-outliers-off.png" style="border: 1px solid #1d2253" alt="ignore-outliers-off" />

Excluding outliers can cause your results to become statistically significant.
By default, outliers are ignored.

  <img src="../../_static/images/ui/overview/metrics/ignore-outliers/ignore-outliers-on.png" style="border: 1px solid #1d2253" alt="ignore-outliers-on" />

#### Highlight Modes




### Params explorer
Params explorer enables a parallel coordinates view for metrics and params. Very helpful when doing hyperparameter search.

Features:
- Easily query any metrics and params
- Group runs or divide into subplots
- Apply chart indicator to see correlations

<img style="border: 1px solid #1d2253" src="../../_static/images/ui/overview/params.png" alt="Params explorer" />

### Images explorer
Track intermediate images and search, compare them on the Images Explorer.

Features:
- Easily query any image
- Group by images by run parameters
- Group images by step

<img style="border: 1px solid #1d2253" src="../../_static/images/ui/overview/images.png" alt="Images explorer" />

### Scatters Explorer
