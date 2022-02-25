## Explorers

### Overview

Aim enables powerful UI to explore logged ML runs and metadata.

<!-- #### Metrics explorer

Metrics explorer helps you to compare 100s of metrics within a few clicks.
It helps to save lots of time compared to other open-source experiment tracking tools.

Features:

- Easily query any metric
- Group by any parameter
- Divide into subplots
- Aggregate grouped metrics (by conf. interval, std. dev., std. err., min/max)
- Apply smoothing
- Change scale of the axes (linear or log)
- Align metrics by time, epoch or another metric

<img style="border: 1px solid #1d2253" src="../../_static/images/ui/overview/metrics.png" />

#### Images explorer

Track intermediate images and search, compare them on the Images Explorer.

Features:

- Easily query any image
- Group by images by run parameters
- Group images by step

<img style="border: 1px solid #1d2253" src="../../_static/images/ui/overview/images.png" /> -->

### Metrics Explorer

### Images Explorer

### Params Explorer

#### Overview

Params explorer helps you to represent high dimensional data as a multi-dimensional visualization

Features:

- [Easily query any metrics and params](#query-any-metrics-and-params)
- [Group runs by color, stroke, or chart](#grouping)
- [Make the crossings easier with curve interpolation](#curve-interpolation)
- [Learn patterns and colorations easier colored by the last dimension with a color indicator](#color-indicator)

<img width="1790" alt="param-explore" src="https://user-images.githubusercontent.com/43929589/155369337-d961536d-e46d-47df-bd73-2a81c965ef4e.png">

##### Query any metrics and params

Select params and metrics from dropdown

<img width="1008" alt="Select params and metrics from dropdown" src="https://user-images.githubusercontent.com/43929589/155546987-3d5dbed6-f966-41f9-9bff-fe0bbbaca75e.png">

Search runs with [Aim QL](../../using/search.html)

<img width="1498" alt="Search runs" src="https://user-images.githubusercontent.com/43929589/155377393-aff5604f-9d9d-474d-8509-807b0c3d0846.png">

##### Grouping

Group by color, stroke, or chart with selected parameters

<img width="1714" alt="Grouping" src="https://user-images.githubusercontent.com/43929589/155545573-89af8bb6-9f8f-4726-8a1b-bc62fb29367f.png">

##### Curve interpolation

By clicking on the Curve interpolation button in the Controls panel, it's possible to make lines from straight to curve to show
correlations between non-adjacent axes.

<img width="1498" alt="Curve interpolation" src="https://user-images.githubusercontent.com/43929589/155543991-e32e07e1-e068-4786-b478-26a634206c5a.png">

##### Color indicator

By clicking on the Color indicator button in the Controls panel, it's possible to turn on lines gradient coloring by the last dimension.

<img width="1498" alt="Color indicator" src="https://user-images.githubusercontent.com/43929589/155535399-f2c1806c-841f-40e9-8337-fd984119623e.png">

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
