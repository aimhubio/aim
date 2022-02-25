## Explorers

### Overview

Aim enables powerful UI to explore logged ML runs and metadata.

#### Metrics explorer
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

<img style="border: 1px solid #1d2253" src="../../_static/images/ui/overview/images.png" />

#### Params explorer
Params explorer enables a parallel coordinates view for metrics and params. Very helpful when doing hyperparameter search.

Features:
- Easily query any metrics and params
- Group runs or divide into subplots
- Apply chart indicator to see correlations

<img style="border: 1px solid #1d2253" src="../../_static/images/ui/overview/params.png" />


### Metrics Explorer

### Images Explorer

### Params Explorer

### Scatters Explorer

Scatter explorer gives ability to visualize correlations between metric last value data with hyper-parameter.

It represents graph where corresponding values from a set of data are placed as points on a coordinate plane. A relationship between the points is sometimes shown to be positive, negative, strong, or weak.

 <img style="border-radius: 8px; border: 1px solid #E8F1FC"  alt="scatters-explore" src="https://raw.githubusercontent.com/arsengit/personalWebsite/master/src/images/scatters.jpg">

Abilities provided by Scatter explorer

- [Easily align metric last value data with hyper parameter](#align-metric-last-value-data-with-hyper-parameter)
- [Group runs by color and chart](#grouping)
- [Represent the points with trend line](#trend-line)
- [Export chart](#export-chart)


##### Align metric last value data with hyper-parameter

Select params and metrics from `X` and `Y` axes dropdowns to align metric last value data with hyper-parameter.

<img width="1008" alt="Select params and metrics from dropdown" src="https://user-images.githubusercontent.com/43929589/155546987-3d5dbed6-f966-41f9-9bff-fe0bbbaca75e.png">

Also, you can search runs with [Aim QL](../../using/search.html)

<img width="1498" alt="Search runs" src="https://user-images.githubusercontent.com/43929589/155377393-aff5604f-9d9d-474d-8509-807b0c3d0846.png">

##### Grouping

Easily group data by color and chart with selected parameters.

- By `Color`

<img width="1714" alt="Grouping" src="https://user-images.githubusercontent.com/43929589/155545573-89af8bb6-9f8f-4726-8a1b-bc62fb29367f.png">

- By `Chart`

<img width="1714" alt="Grouping" src="https://user-images.githubusercontent.com/43929589/155545573-89af8bb6-9f8f-4726-8a1b-bc62fb29367f.png">

##### Trend line

A trend line is a straight line that best represents the points on a `scatter plot`. The trend line may go through some points but need not go through them all.

<img width="1498" alt="Curve interpolation" src="https://user-images.githubusercontent.com/43929589/155543991-e32e07e1-e068-4786-b478-26a634206c5a.png">

From trend line options popover you can change regression from `Linear` (by default) to `LOESS`(locally weighted smoothing), which creates a smooth line through a `scatter plot` to help you to see relationship between variables and foresee trends. Also, you can change the `bandwidth` with `slider`


##### Export chart

Scatter explorer also, gives ability to `export` your chart as `image`.

By clicking `export button` from control panel, will be opened chart preview modal.
You can change exportable chart `image width`, `single chart height`, set `image name` and `format`.

<img width="1498" alt="Color indicator" src="https://user-images.githubusercontent.com/43929589/155535399-f2c1806c-841f-40e9-8337-fd984119623e.png">

Following formats of chart export are available: `SVG`, `JPEG`, `PNG`.

<img width="1498" alt="Color indicator" src="https://user-images.githubusercontent.com/43929589/155535399-f2c1806c-841f-40e9-8337-fd984119623e.png">
