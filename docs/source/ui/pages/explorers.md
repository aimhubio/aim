## Explorers

Explorers will help you to compare 1000s of AI experiments with a few clicks.
Explorers are the main tools that Aim is built around.

In this section we will go through the Aim explorers, introduce their features and how to use them.


### Metrics Explorer

#### Overview

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
- [Configure axes properties (x-axis alignment, axes range)](#axes-properties)
- [Change scale of the axes (linear or log)](#axes-scale)
- [Apply smoothing](#chart-smoothing)
- [Ignore outliers](#ignore-outliers)
- [Metric highlight modes (metric on hover, run on hover)](#highlight-modes)
- [Set chart tooltip parameters](#set-tooltip-parameters)
- [Apply zoom in/out on charts](#apply-zoom-on-charts)
- [Export chart as image](#export-chart-as-image)

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/metrics.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="metrics_explorer" />

#### Select metrics and query runs
On the Metrics Explorer, there is `+ Metrics` button.
Once pressed, a dropdown will appear with all your tracked metrics and their contexts flattened.
The dropdown is searchable - so you can get to your metric of interest within a stroke!

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/select_form_dropdown.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select_form_dropdown" />

The Search bar is located below the `+ Metric` button. It allows to do a pythonic query (that is eval-ed as python statement) over every param you have tracked.

Search runs with [Aim QL](../../using/search.html)

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/select_form_filter.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select_form_filter" />

#### Advanced Search mode

Once you press the `Enable advanced search mode` button underneath the main `Search` button, it will enable the full Aim QL search editor - to query the metrics, the runs via full Aim QL

Here is an example:

`((metric.name == 'bleu' and metric.context.subset == 'val') or (metric.name == 'loss' and metric.context.subset == 'train'))
and 1e-5 < run.hparams.learning_rate < 1e-2`

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/select_form_advanced_search.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select_form_advanced_search" />

#### Group by any parameter

Grouping selected metrics by any tracked params will allow you to quickly distinguish the most impactful params, decisions you have made (the preprocessing steps, the hyperparams etc).

The parameters include not only the ones you have tracked but also the native Aim objects too such as
- `metric.name`
- `metric.context.[context_key]`
- `run.hash`

There are several ways you can group the selected metrics and runs - by color, by stroke and by chart.

##### Group by Color
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

##### Group by Stroke
Groups the metrics by a stroke style.
Has all the rest of the other features available on the color grouping except the advanced mode.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/groupby_stroke.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="groupby_stroke" />

##### Group by Chart
The end result of using this feature: divides into subplots based on the value of the selected params.
Why this is a grouping mechanism? It groups the metrics belonging to the same group into separate charts.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/groupby_chart.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="groupby_chart" />

#### Aggregate metrics

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

#### Axes properties

Axes properties section is for aligning metrics by time, epoch or another metric and for setting axes range manually.

##### Alignment:

Following types of metrics alignment are available: [Step](#step), [Epoch](#epoch), [Relative Time](#relative-time), [Absolute Time](#absolute-time) and [Custom Metric](#custom-metric).
By default, metrics aligned by [Step](#step).

###### Step

By setting metrics alignment to Step, x-axis values will represent the steps of tracked metrics.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/alignment-step.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="alignment_step" />

###### Epoch

By setting metrics alignment to Epoch, x-axis values will represent the epochs of tracked metrics.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/alignment-epoch.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="alignment_epoch" />

###### Relative Time

By setting metrics alignment to Relative Time, x-axis values will represent by `HH:mm:ss`, duration of tracking process.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/alignment-relative.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="alignment_relative" />

###### Absolute Time

By setting metrics alignment to Absolute Time, x-axis values will represent by date `HH:mm:ss D MMM, YY`, since the start date of the first run until the last run.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/alignment-absolute.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="alignment_absolute" />

###### Custom Metric

By setting metrics alignment to Custom Metric, x-axis values will represent selected metric values, you can detect correlations between queried metrics and selected metric.

##### Set axes range:

To fix an axis range across all the charts, set the corresponding axis minimum and maximum bounds in the form.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/set-axes-range.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="set-axes-range" />

#### Axes Scale

Axes Scale section gives ability to display axes scale's [linear](https://en.wikipedia.org/wiki/Linear_scale) or [logarithmic](https://en.wikipedia.org/wiki/Logarithmic_scale).

By default, axes scale's are [Linear](#linear-scale).

##### Linear Scale

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/axes_scale_linear.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="axes_scale_linear" />

##### X-axis scale: Linear, Y-axis scale: Log

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/y_axis_scale_log.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="y-axis-scale-log" />

##### X-axis scale: Log, Y-axis scale: Linear

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/x_axis_scale_log.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="x-axis-scale-log" />

##### Log Scale

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/axes_scale_log.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="axes-scale-log" />

#### Chart Smoothing

While smoothing the chart, the data points are modified so individual points higher than the adjacent points (presumably because of noise) are reduced, and points that are lower than the adjacent points are increased leading to a smoother signal.
You can select curve interpolation methods: Linear or Cubic.
By default, chart smoothing in [Exponential moving average](#exponential-moving-average) mode and curve interpolation method is Linear.

##### Exponential moving average

An [exponential moving average](https://en.wikipedia.org/wiki/Moving_average), also known as an exponentially weighted moving average (EWMA),
is a first-order infinite impulse response filter that applies weighting factors which decrease exponentially.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/smoothing_ema.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="smoothing_ema" />

##### Centered moving average

When you center the moving averages, the data points are placed at the center of the range rather than the end of it.
This is done to position the moving average values at their central positions in time.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/smoothing_cma.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="smoothing_cma" />

#### Ignore outliers

An outlier is an observation that lies an abnormal distance from other values in a random sample from a population.
Examination of the data for unusual observations that are far removed from the mass of data.
These points are often referred to as outliers.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/ignore_outliers_off.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="ignore-outliers-off" />

Excluding outliers can cause your results to become statistically significant.
By default, outliers are ignored.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/ignore_outliers_on.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="ignore-outliers-on" />

#### Highlight Modes

Highlighting functionality is useful for filtering metrics and highlight only hovered metric.
Following types of highlighting mode are available: [Highlight Off](#highlight-off), [Highlight Metric on Hover](#highlight-metric-on-hover), and [Highlight Run on Hover](#highlight-run-on-hover).
By default, highlighting mode is the [Highlight Run on Hover](#highlight-run-on-hover).

##### Highlight Off

By setting Highlight mode Off, there is no highlighting functionality on hover.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/highlight_off.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="highlight_off" />

##### Highlight Metric on Hover

By setting Highlight mode Metric on Hover, mouse point closest metric highlights and other metrics displays with opacity.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/highlight_metric.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="highlight_metric" />

##### Highlight Run on Hover

By setting Highlight mode Run on Hover, mouse point closest metric highlights and highlighted metric corresponding run also highlights other metrics displays with opacity.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/highlight_run.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="highlight_run" />

#### Set tooltip parameters

You can select tooltip parameters to show params and values in tooltip Params section.
You can select hide or show button to display or hide tooltip on hover.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/tooltip_parameters_popover.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="tooltip-parameters-popover" />

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/tooltip_select_parameters.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="select-tooltip-parameters" />

#### Apply zoom on charts

##### Zoom In

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/zoom_in_popover.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="zoom-in-popover.png" />

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/zoom_in_action.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="zoom-in-action.png" />

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/zoom_out.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="zoom-out.png" />

##### Zoom Out

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/zoom_out_popover.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="zoom_out_popover" />

#### Export chart as image

Metric explorer also, gives ability to export your chart as image.
By clicking `export button` from control panel, will be opened chart preview modal.
You can change exportable chart `image width`, `single chart height`, set `image name` and `format`.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/export_preview.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="export_preview" />

Following formats of chart export are available: `SVG`, `JPEG`, `PNG`.

<img width="100" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/export_format.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="export-format" />

### Images Explorer

#### Overview

Track intermediate images search easily by using select form functional compare them on the Images Explorer by using reach controls panel.

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore.png">

Features:

- [Easily query any image](#query-any-image)
- [Group images by run parameters, step and index](#group-image-by-run-parameters)
- [Use controls from right control panel to configure workspace](#image-explorer-right-controls-panel)
  - [Image properties control](#images-properties-control)
  - [Images sorting control](#images-sorting-control)
  - [Images group stacking control](#images-group-stacking-control)
  - [Images tooltip params control](#set-tooltip-parameters)

#### Query any image

Use select form to easily query any image. There are two option to query images using dropdown, by using [Aim QL](../../using/search.html) language and advance mode for [Aim QL](../../using/search.html).

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-select-form.png">

###### How to use select form?

- Click on Images button
- Select options you are want to use in query
- Click on the Search button

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-select-dropdown.png">

###### How to reset select form value?

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-select-form-reset.png">

###### How to use advanced query mode?

- Click on pencel icon in the right side of select form to show input
- Type advance [Aim QL](../../using/search.html) query
- Click on the Search button

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-query-advanced-mode-on.png">

#### Group image by run parameters

Use select grouping dropdown which is located in the right top corner of the image explore page.

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/grouping-button.png">

###### How to use image grouping?

- Click on grouping button
- Select fields by which you want to groupe images

Grouping will be apply after each field selection also you can select grouping mode (Group or Reverse)

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/grouping-with-opened-dropdown.png">

#### Image explorer right controls panel

Any change in controls will help to explore images better on the workspace

#### Images size manipulation control

- Click on image property button
- Select value from dropdown to align image. (by default dropdown value is `Height`). Use slider to configure value for scale relative to window size by default scale value is `15%`.

  - By height

    <img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-size-by-height.png">

  - By width

    <img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-size-by-width.png">

  - Original size

    <img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-size-by-original-size.png">

- Use image rendering variation by default value of this control is `Pixelated`

 <img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-rendering.png">

#### Images sorting control

- Click on image sorting button
- Select fields for sorting images. Selection ordering is meaningful and data will be sorting by selection order. Bellow is visible Ordered By list where contains all selected fields from dropdown. You can remove any already selected field by clicking on `x` icon or change sorting direction by clicking radio button Asc or Desc. Default selected direction is Asc.
- For reset all existing sorting fields you can simply click on Reset Sorting button

<img alt="Images sorting popover" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-sorting-desc.png">

#### Set tooltip parameters

You can select tooltip parameters to show params and values in tooltip Params section.
You can select hide or show button to display or hide tooltip on hover.

<img src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/metrics-explorer/tooltip_parameters_popover.png" style="border-radius: 8px; border: 1px solid #E8F1FC" alt="tooltip-parameters-popover" />

### Params Explorer

#### Overview

Params explorer helps you to represent high dimensional data as a multi-dimensional visualization.
Features:

- [Easily query any metrics and params](#query-any-metrics-and-params)
- [Group runs by color, stroke, or chart](#grouping)
- [Make the crossings easier with curve interpolation](#curve-interpolation)
- [Learn patterns and colorations easier colored by the last dimension with a color indicator](#color-indicator)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Params explore" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/1.png">

##### Query any metrics and params

Select params and metrics from dropdown

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select params and metrics from dropdown" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/2.png">

Search runs with [Aim QL](../../using/search.html)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Search runs" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/3.png">

##### Grouping

Group by color, stroke, or chart with selected parameters

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Grouping" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/4.png">

##### Curve interpolation

By clicking on the Curve interpolation button in the Controls panel, it's possible to make lines from straight to curve to show
correlations between non-adjacent axes.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Curve interpolation" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/5.png">

##### Color indicator

By clicking on the Color indicator button in the Controls panel, it's possible to turn on lines gradient coloring by the last dimension.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Color indicator" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/params-explore/6.png">

### Scatters Explorer

Scatter explorer gives ability to visualize correlations between metric last value data with hyper-parameter.

It represents graph where corresponding values from a set of data are placed as points on a coordinate plane. A relationship between the points is sometimes shown to be positive, negative, strong, or weak.

<img alt="scatters-explore" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters.png">

Abilities provided by Scatter explorer

- [Easily align metric last value data with hyper parameter](#align-metric-last-value-data-with-hyper-parameter)
- [Group runs by color and chart](#grouping)
- [Represent the points with trend line](#trend-line)
- [Export chart](#export-chart)

##### Align metric last value data with hyper-parameter

Select params and metrics from `X` and `Y` axes dropdowns to align metric last value data with hyper-parameter.

- X axis

<img alt="x axis dropdown" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/select-x-axis.png">

- Y axis

<img alt="y axis dropdown" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/select-y-axis.png">

Also, you can search runs with [Aim QL](../../using/search.html)

<img alt="search runs" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters-search.png">

##### Grouping

Easily group data by color and chart with selected parameters.

- By `Color`

<img alt="Grouping color" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters-color-group.png">

- By `Chart`

<img alt="Grouping chart line" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/scatters-color-group.png">

##### Trend line

A trend line is a straight line that best represents the points on a `scatter plot`. The trend line may go through some points but need not go through them all.

<img alt="trend line" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/trendline.png">

From trend line options popover you can change regression from `Linear` (by default) to `LOESS`(locally weighted smoothing), which creates a smooth line through a `scatter plot` to help you to see relationship between variables and foresee trends. Also, you can change the `bandwidth` with `slider`

<img alt="trend line loess" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/trendline-loess.png">

##### Export chart

Scatter explorer also, gives ability to `export` your chart as `image`.

By clicking `export button` from control panel, will be opened chart preview modal.
You can change exportable chart `image width`, `single chart height`, set `image name` and `format`.

<img alt="export chart" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/export-chart.png">

Following image formats are available export: `SVG`, `JPEG`, `PNG`.

<img width="100" alt="export format" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/scatters-explorer/export-format.png">
