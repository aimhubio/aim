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

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/
images-select-dropdown.png">

###### How to reset select form value?

<img alt="Images explore overview" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/
images-explore-select-form-reset.png">

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

#### Set tooltip parameters

You can select tooltip parameters to show params and values in tooltip Params section.
You can select hide or show button to display or hide tooltip on hover.

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
