# Overview
<div align="center">

<img src="https://user-images.githubusercontent.com/13848158/136364717-0939222c-55b6-44f0-ad32-d9ab749546e4.png" height="70" />
<br />
<br />
<h4>
Aim package logs your training runs, enables a beautiful UI to compare them and an API to query them programmatically.
</h4>
</div>

## Why use Aim?

- Modern ML development revolves around collection and analysis of AI metadata (training metrics, images, distributions etc) to analyze and explore different aspects of the model performance.

- There is both a need to manually explore and compare the metadata as well as automate for different infrastructure needs.

- Aim helps to track AI metadata and
  - Explore it manually through the most advanced open-source experiment comparison web UI.
  - Query programmatically in your favorite notebook or through script for automation.

- Use Aim to seamlessly log your ML metadata in your training environment and explore through UI and code. **Aim is free, open-source and self-hosted.**

## What can you do with Aim?

### Log metrics and params

Use the [Aim SDK](./quick_start/SDK_basics.html) to [log as many metrics and params](./quick_start/SDK_basics.html#track-params-and-metrics-with-run) as you need for your training and evaluation runs.
Aim users track 1000s of training runs and sometimes more than 100s of metrics per run with lots of steps.

### Query metadata on Web UI
Aim enables a powerful pythonic query language to filter through metadata.
It's like a python if statement over everything you have tracked. You can use this on all explorer screens.

### Runs explorer
Runs explorer will help you to hollistically view all your runs, each metric last tracked values and tracked hyperparameters.

<img style="border: 1px solid #1d2253" src="./_static/images/overview/runs.png" />

### Metrics explorer
Metrics explorer helps you to compare 100s of metrics within a few clicks.
It helps to save lots of time compared to other open-source experiment tracking tools.

<img style="border: 1px solid #1d2253" src="./_static/images/overview/metrics.png" />

### Images explorer
Track intermediate images and search, compare them on the Images Explorer.

<img style="border: 1px solid #1d2253" src="./_static/images/overview/images.png" />

### Params explorer
Params explorer enables a parallel coordinates view for metrics and params. Very helpful when doing hyperparameter search.

<img style="border: 1px solid #1d2253" src="./_static/images/overview/params.png" />

### Query metadata programmatically
Use the same pythonic if statement to query the data through the Aim SDK programmatically.

## How Aim works?

**Aim is a python package with three main components:**

- Aim Storage:
  - A rocksdb-based embedded storage where the metadata is stored locally
- Aim SDK:
  - A simple python interface that allows to track AI metadata
    - metrics
    - hyperparameters
    - images
    - distributions
- Aim UI:
  - A self-hosted web interface to deeply explore the tracked metadata

**Integrated with your favorite tools**

<img src="https://user-images.githubusercontent.com/13848158/96861310-f7239c00-1474-11eb-82a4-4fa6eb2c6bb1.jpg" width="70" />
<img src="https://user-images.githubusercontent.com/13848158/96859323-6ba90b80-1472-11eb-9a6e-c60a90f11396.jpg" width="70" />
<img src="https://user-images.githubusercontent.com/13848158/96861315-f854c900-1474-11eb-8e9d-c7a07cda8445.jpg" width="70" />
<img src="https://user-images.githubusercontent.com/13848158/97086626-8b3c6180-1635-11eb-9e90-f215b898e298.png" width="70" />
<img src="https://user-images.githubusercontent.com/13848158/112145238-8cc58200-8bf3-11eb-8d22-bbdb8809f2aa.png" width="70" />
<img src="https://user-images.githubusercontent.com/13848158/118172152-17c93880-b43d-11eb-9169-785e4b52d89c.png" width="70" />

## Comparisons to familiar tools

### Tensorboard
**Training run comparison**

Order of magnitude faster training run comparison with Aim
- The tracked params are first class citizens at Aim. You can search, group, aggregate via params - deeply explore all the tracked data (metrics, params, images) on the UI.
- With tensorboard the users are forced to record those parameters in the training run name to be able to search and compare. This causes a super-tedius comparison experience and usability issues on the UI when there are many experiments and params. TensorBoard doesn't have features to group, aggregate the metrics.

**Scalability**

- Aim is built to handle 1000s of training runs with dozens of experiments each - both on the backend and on the UI.
- TensorBoard becomes really slow and hard to use when a few hundred training runs are queried / compared.

**Beloved TB visualizations to be added on Aim**

- Distributions / gradients visualizations.
- Embedding projector.
- Neural network visualization.

### MLFlow
MLFlow is an end-to-end ML Lifecycle tool.
Aim is focused on training tracking.
The main differences of Aim and MLflow are around the UI scalability and run comparison features.

**Run comparison**

- Aim treats tracked parameters as first-class citizens. Users can query runs, metrics, images and filter using the params.
- MLFlow does have a search by tracked config, but there are no grouping, aggregation, subplotting by hyparparams and other comparison features available.

**UI Scalability**

- Aim UI can handle several thousands of metrics at the same time smoothly with 1000s of steps. It may get shaky when you explore 1000s of metrics with 10000s of steps each. But we are constantly optimizing!
- MLflow UI becomes slow to use when there are a few hundreds of runs.

### Weights and Biases

Hosted vs self-hosted
- Weights and Biases is a hosted closed-source experiment tracker.
- Aim is self-hosted free and open-source.
  - Remote self-hosted Aim is coming soon...
  
## Community

If you have questions please:
1. [Open a feature request or report a bug](https://github.com/aimhubio/aim/issues)
2. [Join our slack](https://slack.aimstack.io/)
