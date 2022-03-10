## Overview

Aim enables powerful UI to explore logged ML runs and metadata. Aim is built around 5 key parts:

- Runs explorer
- Metrics explorer
- Images explorer
- Params explorer
- Single run page

### Runs explorer
Runs explorer allows to have the full research context at hand. In this section, you can holistically view all your runs, each metric's last tracked values and tracked hyperparameters.

Features:
- Search runs by date, experiment, hash, tag or parameters
- Search by run/experiment
- Customize the table

<img style="border: 1px solid #1d2253" src="../_static/images/ui/overview/runs.png" />

### Metrics explorer
Metrics explorer helps you compare 100s of metrics within a few clicks.
It helps to save lots of time compared to other open-source experiment tracking tools.

Features:
- Easily query any metric
- Group the plot lines by any parameter
- Divide the plots into subplots
- Aggregate grouped metrics (by conf. interval, std. dev., std. err., min/max)
- Apply smoothing 
- Change scale of the axes (linear or log)
- Align metrics by time, epoch or another metric

<img style="border: 1px solid #1d2253" src="../_static/images/ui/overview/metrics.png" />

### Images explorer
Images Explorer allows to search and compare the intermediate images you've tracked.

Features:
- Easily query all images corresponding to your search criteria
- Group images by run parameters
- Group images by step

<img style="border: 1px solid #1d2253" src="../_static/images/ui/overview/images.png" />

### Params explorer
Params explorer enables a parallel coordinates view for metrics and params. Very helpful when doing hyperparameter search.
