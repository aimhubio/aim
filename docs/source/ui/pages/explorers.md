# Explorers

Explorers will help you to compare 1000s of AI experiments with a few clicks.
Explorers are the main tools that Aim is built around.

In this section we will go through the Aim explorers, introduce their features and how to use them.


# Metrics Explorer

## Overview

Use Metrics explorer to search and compare 1000s of ML training metrics.

The Metrics Explorer allows you to search, group and compare your metrics.
Due to this and number of other visual features on the Metrics Explorer, you will save considerable amounts of time when comparing experiments- compared to other open-source experiment tracking tools.

The Metric Explorer has the following main sections:
- **Metrics Select:** to select the metrics for exploration
- **Search bar:** to query the runs for exploration
- **Charts explorer:** the space where the metrics are rendered
- **Metrics modifiers:** all the grouping, chart division and other metrics modifier tools
- **Context table:** the full information about the selected metrics is available

.. note::
There is also an advanced mode of search is available too where you can use the full Aim QL (more on this further in this section).

There are two ways you can query metrics and runs
- [Select metrics and query runs](#id1)
- [Advanced Search mode](#advanced-search-mode)

An overview of what you can do with queried metrics - the modifiers:
- [Group by tracked parameters](#group-by-any-parameter)
- [Aggregate grouped metrics](#aggregate-metrics)
- [Align metrics by time, epoch or custom metric](#x-axis-properties)
- [Change scale of the axes (linear or log)](#axes-scale)
- [Apply smoothing](#chart-smoothing)
- [Ignore outliers](#ignore-outliers)
- [Metric highligh modes (metric on hover, run on hover)](#highlight-modes)
- [Set chart tooltip parameters](#set-tooltip-parameters)
- [Apply zoom in/out on charts](#apply-zoom-on-charts)
- [Export chart as image](#export-chart-as-image)

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/metrics.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="metrics_explorer" />

## Select metrics and query runs
On the Metrics Explorer, there is `+ Metrics` button.
Once pressed, a dropdown will appear with all your tracked metrics and their contexts flattened.
The dropdown is searchable - so you can get to your metric of interest within a stroke!

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/select_form_dropdown.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select_form_dropdown" />

The Search bar is located below the `+ Metric` button. It allows to do a pythonic query (that is eval-ed as python statement) over every param you have tracked.

Search runs with [Aim QL](../../using/search.html)

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/select_form_filter.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select_form_filter" />

## Advanced Search mode

Once you press the `Enable advanced search mode` button underneath the main `Search` button, it will enable the full Aim QL search editor - to query the metrics, the runs via full Aim QL

Here is an example:

`((metric.name == 'bleu' and metric.context.subset == 'val') or (metric.name == 'loss' and metric.context.subset == 'train'))
and 1e-5 < run.hparams.learning_rate < 1e-2`

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/select_form_advanced_search.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select_form_advanced_search" />

## Group by any parameter

Grouping selected metrics by any tracked params will allow you to quickly distinguish the most impactful params, decisions you have made (the preprocessing steps, the hyperparams etc).

The parameters include not only the ones you have tracked but also the native Aim objects too such as
- `metric.name`
- `metric.context.[context_key]`
- `run.hash`

There are several ways you can group the selected metrics and runs - by color, by stroke and by chart.

### Group by Color
Use this to divide the selected metrics into different clusters based on selected values of params.
Each cluster gets colored differently.

There are a number of options available when grouping
- **group by values** - divides into clusters as per the values of selected params)
- **reverse grouping** - divides into clusters by every param except for the chosen one.

The grouping colors are picked randomly, however it is possible to fix with the advanced coloring features.

Here are the features in the advanced mode:
- Fix the colors of the grouping
- Control the color palette to use during the grouping

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/groupby_color.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="groupby_color" />

### Group by Stroke
Groups the metrics by a stroke style.
Has all the rest of the other features available on the color grouping except the advanced mode.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/groupby_stroke.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="groupby_stroke" />

### Group by Chart
The end result of using this feature: divides into subplots based on the value of the selected params.
Why this is a grouping mechanism? It groups the metrics belonging to the same group into separate charts.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/groupby_chart.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="groupby_chart" />


## Aggregate metrics

The metrics aggregation helps to quickly see the trends of each individual group of metrics. See more about [metrics grouping](#group-by-any-parameter).

There are two aspects of aggregation you can control:
- the trend-line
- the area that the group of metricsc take

The trend-line calculation methods:
- Mean
- Median
- Min
- Max

The area calcualtion methods:
- None _(when you'd like to remove the area)_
- Min/Max
- Mean +/- Standard Deviation
- Mean +/- Standard Error
- Confidence Interval (95%)

Pls see the screenshot:

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/aggr_line_mean.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="aggr_line_mean" />


## X-Axis properties

X-Axis properties section is for controlling density of metrics x-axis values and aligning metrics by time, epoch or another metric.

### Density:

The following types of metrics density are available: [Minimum](#minimum), [Medium](#medium), [Maximum](#maximum).
By default, the metrics density is set to [Maximum](#maximum).

- setting metrics density to Minimum will query metrics by 50 point.
- setting metrics density to Medium will query metrics by 250 point.
- setting metrics density to Maximum will query metrics by 500 point.

### Alignment:

The following types of metrics alignment are available: [Step](#step), [Epoch](#epoch), [Relative Time](#relative-time), [Absolute Time](#absolute-time) and [Custom Metric](#custom-metric).
By default, the metrics are aligned by [Step](#step).


- By setting metrics alignment to Step, x-axis values will represent the steps of tracked metrics.
- By setting metrics alignment to Epoch, x-axis values will represent the epochs of tracked metrics.
- By setting metrics alignment to Relative Time, x-axis values will represent by `HH:mm:ss`, duration of tracking process.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/alignment_relative.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="alignment_relative" />

- By setting metrics alignment to Absolute Time, x-axis values will be represented in the following date format `HH:mm:ss D MMM, YY`, for the period since the first run until the last run.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/alignment_absolute.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="alignment_absolute" />

- By setting metrics alignment to Custom Metric, x-axis values will represent selected metric values, so you can detect correlations between the queried metrics and the selected metrics.


## Axes Scale

Axes Scale allows to choose between [linear](https://en.wikipedia.org/wiki/Linear_scale) and [logarithmic](https://en.wikipedia.org/wiki/Logarithmic_scale) scales.
By default, axes' scales are [Linear](#linear-scale).

Example: X-axis scale: Linear, Y-axis scale: Log

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/y_axis_scale_log.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="y-axis-scale-log" />

## Chart Smoothing

While smoothing the chart, the data points are modified so that the individual points that are higher than the adjacent points (presumably because of noise) are reduced, and points that are lower than the adjacent points are increased leading to a smoother signal.
You can select between 2 curve interpolation methods: Linear or Cubic.
By default, chart smoothing is set to Linear in [Exponential moving average](#exponential-moving-average) mode and curve interpolation method.

### Exponential moving average

[Exponential moving average](https://en.wikipedia.org/wiki/Moving_average), also known as an exponentially weighted moving average (EWMA),
is a first-order infinite impulse response filter that applies weighting factors which decrease exponentially.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/smoothing_ema.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="smoothing_ema" />

### Centered moving average

When you center the moving averages, the data points are placed at the center of the range rather than the end of it.
This is done to position the moving average values at their central positions in time.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/smoothing_cma.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="smoothing_cma" />


## Ignore outliers

An outlier is an observation that lies an abnormal distance from other values in a random sample from a population. Excluding outliers might increase the statistical significance of your results. By default, outliers are ignored.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/ignore_outliers_off.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="ignore-outliers-off" />


## Highlight Modes

This functionality is useful for highlighting the lines you're hovering over.
The following types of highlighting modes are available: [Highlight Run on Hover](#highlight-run-on-hover), [Highlight Metric on Hover](#highlight-metric-on-hover), and [Highlight Off](#highlight-off).
The default highlighting mode is [Highlight Run on Hover](#highlight-run-on-hover).


### Highlight Run on Hover

This mode highlights all run-related information on the chart you're hovering over, but also on the other charts that contain metrics from the highlighted run. Non hovered runs are displayed with opacity.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/highlight_run.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="highlight_run" />

### Highlight Metric on Hover

This mode highlights only the hovered metric.  Non hovered metrics are displayed with opacity.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/highlight_metric.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="highlight_metric" />

### Highlight Off

By setting Highlight mode Off, no highlighting is applied on hover.



## Set tooltip parameters

Tooltip keeps the key information visible when hovering over charts. You can select what information to add to the toolti in tooltip 'Parameters' section.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/tooltip_select_parameters.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select-tooltip-parameters" />

You can also set the tooltip to hidden if needed.
<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/tooltip_parameters_popover.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="tooltip-parameters-popover" />

## Apply zoom on charts

## Zoom In

Zoom in has 2 options: single zoom in and multiple zoom in.
- single zoom in allows to zoom only one time on a given chart
- multiple zoom in allows to zoom unlimeted times on a given chart

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/zoom_in_action.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="zoom-in-action.png" />

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/zoom_out.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="zoom-out.png" />

## Zoom Out
Zoom out has 2 options: zoom out and reset zooming. 
- zoom out will cancel a single zoom in action
- reset zooming will reset the chart to its intial scale. 

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/zoom_out_popover.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="zoom_out_popover" />


## Export chart as image

Metric explorer gives ability to export your chart as image.
Clicking `export button` from control panel will open chart preview modal.
You can change exportable charts' `image width`, `single chart height`, set `image name` and `format`.
The following formats of chart exports are available: `SVG`, `JPEG`, `PNG`.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/export_preview.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="export_preview" />



# Images Explorer

## Overview

Images Explorer allows to search and compare the intermediate images you've tracked through Aim's rich controls panel.

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore.png">

Features:

- [Easily query any image](#query-any-image)
- [Group images by run parameters, step and index](#group-image-by-run-parameters)
- [Use controls from the control panel to configure workspace](#image-explorer-right-controls-panel)
  - [Image properties control](#images-properties-control)
  - [Images sorting control](#images-sorting-control)
  - [Images group stacking control](#images-group-stacking-control)
  - [Images tooltip params control](#set-tooltip-parameters)


## Query images

On the Images Explorer, there is + Images button. Once pressed, a dropdown will appear with all your tracked images and their contexts flattened. The dropdown is searchable - so you can get to your metric of interest within a stroke!

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-select-dropdown.png">

The Search bar is located below the + Images button. It allows to do a pythonic query (that is eval-ed as python statement) over every param you have tracked. Search runs with [Aim QL](../../using/search.html)

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-select-form.png">

### Advanced Search mode

Once you press the 'Enable advanced search mode' button underneath the main 'Search' button, it will enable the full Aim QL search editor - to query the metrics, the runs via full [Aim QL](../../using/search.html)

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-query-advanced-mode-on.png">


## Group by any parameter

Grouping selected images by any tracked params will allow you to quickly distinguish the most impactful params, decisions you have made (the preprocessing steps, the hyperparams etc).

The parameters include not only the ones you have tracked but also the native Aim objects too such as

- 'metric.name'
- 'metric.context.[context_key]'
- 'run.hash'

### How to use image grouping?

Use select grouping dropdown which is located in the right top corner of the image explorer page. Select fields by which you want to group images. Grouping will be apply after each field selection.

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/grouping-with-opened-dropdown.png">


## Image explorer controls panel

### Image properties

'Image properties' allows to select 2 values: image size and image smoothness.

1. Image size. Select the parameter by which you'd like to align images: `Height`, `Width` or `Original size` (the default parameter is `Height`). Use the slider to configure the scale relative to the window size.
2. Image smoothness. The default value of this control is `Pixelated`, you can change it to `Smoother`

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-size-by-height.png">

### Images sorting 

This functionality allows to sort images by params and/or metrics you've tracked. 

Select fields by which you'd like to sort images. Selection order is meaningful as data will be sorted by selection order.You can remove selected fields by clicking on `x` icon or change the sorting direction by clicking radio button Asc or Desc. Default direction is Asc.
To reset all existing sorting fields you can simply click on `Reset Sorting` button

<img alt="Images sorting popover" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-sorting-desc.png">

### Set tooltip parameters

Tooltip keeps the key information visible when hovering over charts. You can select what information to add to the toolti in tooltip 'Parameters' section.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/tooltip_parameters_popover.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="tooltip-parameters-popover" />


# Params Explorer

## Overview

Params explorer helps you to represent high dimensional data as a multi-dimensional visualization.
Features:

- [Easily query any metrics and params](#query-any-metrics-and-params)
- [Group runs by color, stroke, or chart](#grouping)
- [Make the crossings easier with curve interpolation](#curve-interpolation)
- [Learn patterns and colorations easier colored by the last dimension with a color indicator](#color-indicator)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Params explore" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/1.png">

## Query any metrics and params

Select params and metrics from dropdown

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select params and metrics from dropdown" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/2.png">

Search runs with [Aim QL](../../using/search.html)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Search runs" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/3.png">

## Grouping

Group by color, stroke, or chart with selected parameters

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Grouping" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/4.png">

## Curve interpolation

By clicking on the Curve interpolation button in the Controls panel, it's possible to change lines from straight to curve to show correlations between non-adjacent axes.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Curve interpolation" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/5.png">

## Color indicator

Clicking on the Color indicator button in the Controls panel will turn on lines gradient coloring. The coloring is based on the last dimension of your selection.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Color indicator" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/6.png">


# Scatters Explorer

Scatter explorer allows to visualize correlations between metrics' last values and hyper-parameters.

It represents a graph where thecorresponding values from a set of data are placed as points on a coordinate plane.

<img alt="scatters-explore" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters.png">

Abilities provided by Scatter explorer

- [Easily align metric last value data with hyper parameter](#align-metric-last-value-data-with-hyper-parameter)
- [Group runs by color and chart](#grouping)
- [Represent the points with trend line](#trend-line)
- [Export chart](#export-chart)

## Align metrics' last values with hyper-parameters

Select params and metrics from `X` and `Y` axes dropdowns to align metric last values with hyper-parameters.
You can as well filter runs with [Aim QL](../../using/search.html)

<img alt="search runs" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters-search.png">

## Grouping

Easily group data by color and chart with selected parameters.

- By `Color`

<img alt="Grouping color" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters-color-group.png">

- By `Chart`

<img alt="Grouping chart line" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters-color-group.png">

## Trend line

The trend line is a straight line that best represents the points on a `scatter plot`. The trend line may go through some points but need not go through them all.

<img alt="trend line" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/trendline.png">

From trend line options popover you can change regression from `Linear` (by default) to `LOESS`(locally weighted smoothing), which creates a smooth line through a `scatter plot` to help you see the relationship between variables and foresee trends. You can change the `bandwidth` using the slider.

<img alt="trend line loess" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/trendline-loess.png">

## Export chart

Scatter explorer gives ability to export your chart as image. Clicking export button from control panel will open chart preview modal. You can change exportable charts' `image width`, `single chart height`, set `image name` and `format`.

The following image formats are available for export: `SVG`, `JPEG`, `PNG`.

<img alt="export chart" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/export-chart.png">
