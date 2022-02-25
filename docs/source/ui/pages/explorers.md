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

//image

Features:

- [Easily query any image](#query-any-image)
- [Group images by run parameters, step and index](#group-image-by-run-parameters)
- [Use controls from right control panel to configure workspace](#image-explorer-right-controls-panel)
  - [Image properties control](#images-properties-control)
  - [Images sorting control](#images-sorting-control)
  - [Images group stacking control](#images-group-stacking-control)
  - [Images tooltip params control](#images-tooltip-params-control)

#### Query any image
Use select form to easily query any image. There are two option to query images using dropdown, by using [Aim QL](../../using/search.html) language and advance mode for [Aim QL](../../using/search.html).

// Select form image

###### How to use select form?
- Click on Images button
- Select options you are want to use in query
- Click on the Search button

// Select form image with opened dropdown selected some option and hovered on search button

###### How to reset select form value?
// Select form image with hovered in reset icon

###### How to use advanced query mode?
- Click on pencel icon in the right side of select form to show input
- Type advance [Aim QL](../../using/search.html) query 
- Click on the Search button
// Select form image with typed some AIM ql query and hovered on search button

#### Group image by run parameters
Use select grouping dropdown which is located in the right top corner of the image explore page.
// image grouping button
###### How to use image grouping?
- Click on grouping button
- Select fields by which you want to groupe images

Grouping will be apply after each field selection also you can select grouping mode (Group or Reverse)

// Grouping opened popover selected some fields
#### Image explorer right controls panel
Any change in controls will help to explore images better on the workspace
#### Images properties control
- Click on image property button
- Select value from align image by dropdown by default dropdown value is `Height`
- Use slider to configure value for scale relative to window size by default scale value is `15%`
- Use image rendering variation by default value of this control is `Pixelated`
##### Images sorting control
- Click on image sorting button
- Select fields for sorting images. Selection ordering is meaningful and data will be sorting by selection order. Bellow is visible Ordered By list where contains all selected fields from dropdown. You can remove any already selected field by clicking on `x` icon or change sorting direction by clicking radio button Asc or Desc. Default selected direction is Asc.
- For reset all existing sorting fields you can simply click on Reset Sorting button


Select params and metrics from

//image

Search runs with [Aim QL](../../using/search.html)

-

### Params Explorer

#### Overview

Params explorer helps you to represent high dimensional data as a multi-dimensional visualization

<img width="1790" alt="param-explore" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://user-images.githubusercontent.com/43929589/155369337-d961536d-e46d-47df-bd73-2a81c965ef4e.png"

Features:

- [Easily query any metrics and params](#query-any-metrics-and-params)
- [Group runs by color, stroke, or chart](#grouping)
- [Make the crossings easier with curve interpolation](#curve-interpolation)
- [Learn patterns and colorations easier colored by the last dimension with a color indicator](#color-indicator)

##### Query any metrics and params

Select params and metrics from dropdown

<img width="1008" alt="Select params and metrics from dropdown" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://user-images.githubusercontent.com/43929589/155546987-3d5dbed6-f966-41f9-9bff-fe0bbbaca75e.png">

Search runs with [Aim QL](../../using/search.html)

<img width="1498" alt="Search runs" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://user-images.githubusercontent.com/43929589/155377393-aff5604f-9d9d-474d-8509-807b0c3d0846.png">

##### Grouping

Group by color, stroke, or chart with selected parameters

<img width="1714" alt="Grouping" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://user-images.githubusercontent.com/43929589/155545573-89af8bb6-9f8f-4726-8a1b-bc62fb29367f.png">

##### Curve interpolation

By clicking on the Curve interpolation button in the Controls panel, it's possible to make lines from straight to curve to show
correlations between non-adjacent axes.

<img width="1498" alt="Curve interpolation" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://user-images.githubusercontent.com/43929589/155543991-e32e07e1-e068-4786-b478-26a634206c5a.png">

##### Color indicator

By clicking on the Color indicator button in the Controls panel, it's possible to turn on lines gradient coloring by the last dimension.

<img width="1498" alt="Color indicator" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://user-images.githubusercontent.com/43929589/155535399-f2c1806c-841f-40e9-8337-fd984119623e.png">

### Scatters Explorer
