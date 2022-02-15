<br />
<div align="center">
  <img src="https://user-images.githubusercontent.com/13848158/136364717-0939222c-55b6-44f0-ad32-d9ab749546e4.png" height="70" />
</div>
<br />
<div align="center">
  <strong>An easy-to-use & supercharged open-source experiment tracker</strong><br>
  Aim logs your training runs, enables a beautiful UI to compare them and an API to query them programmatically.<br>
  <sub>Available for Linux and macOS.</sub>
</div>
<br/>
<p align="center">
  <a href="https://aimstack.readthedocs.io/en/latest/"><b>Documentation</b></a> &bull;
  <a href="https://aimstack.readthedocs.io/en/latest/quick_start/getting_started.html"><b>Aim in 3 steps</b></a> &bull;
  <a href=""><b>Demo</b></a> &bull;
  <a href="https://github.com/aimhubio/aim/tree/main/examples"><b>Examples</b></a> &bull;
  <a href="https://github.com/aimhubio/aim#roadmap"><b>Roadmap</b></a> &bull;
    <a href="https://github.com/aimhubio/aim#comparisons-to-familiar-tools"><b>Alternatives</b></a> &bull;
  <a href="https://slack.aimstack.io/"><b>Slack Community</b></a> &bull;
  <a href="https://twitter.com/aimstackio"><b>Twitter</b></a>
</p>

---

<div align="center">
  
[![PyPI Package](https://img.shields.io/pypi/v/aim?color=yellow)](https://pypi.org/project/aim/)
[![PyPI Downloads](https://img.shields.io/pypi/dw/aim?color=green)](https://pypi.org/project/aim/)
[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/aim)](https://pypi.org/project/aim/)
[![Issues](https://img.shields.io/github/issues/aimhubio/aim)](http://github.com/aimhubio/aim/issues)
[![License](https://img.shields.io/badge/License-Apache%202.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)

<kbd>
  <img src="" />
</kbd>

<br />

<h6 style="color: grey">Integrate seamlessly with your favorite tools</h6>

<img src="https://user-images.githubusercontent.com/13848158/96861310-f7239c00-1474-11eb-82a4-4fa6eb2c6bb1.jpg" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/96859323-6ba90b80-1472-11eb-9a6e-c60a90f11396.jpg" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/96861315-f854c900-1474-11eb-8e9d-c7a07cda8445.jpg" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/97086626-8b3c6180-1635-11eb-9e90-f215b898e298.png" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/112145238-8cc58200-8bf3-11eb-8d22-bbdb8809f2aa.png" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/118172152-17c93880-b43d-11eb-9169-785e4b52d89c.png" width="100" />

</div>

# About Aim

| Track and version ML runs | Visualize runs via beautiful UI | Query runs metadata via SDK |
|:--------------------:|:------------------------:|:-------------------:|
| ![](docs/source/_static/images/overview/metrics.png?raw=true) | ![](docs/source/_static/images/overview/metrics.png?raw=true) | ![](docs/source/_static/images/overview/metrics.png?raw=true) |

Aim is an open-source, self-hosted ML experiment tracking tool. Aim is good at tracking lots (1000s) of runs and allowing you to compare them with a performant and beautiful UI.

You can use Aim not only through its UI but also through its SDK to query your runs' metadata programmatically for automations and additional analysis.
Aim's mission is to democratize AI dev tools.

# Demos

| WNMT | lightweight-GAN |
|:---:|:---:|
| ![](docs/source/_static/images/overview/metrics.png?raw=true) | ![](docs/source/_static/images/overview/metrics.png?raw=true) |
| Neural machine translation (NMT) competition winning logs. | Tranining logs of 'lightweight' GAN, proposed in ICLR 2021. |

| FastSpeech 2 | Simple MNIST |
|:---:|:---:|
| ![](docs/source/_static/images/overview/metrics.png?raw=true) | ![](docs/source/_static/images/overview/metrics.png?raw=true) |
| Training logs of Microsoft's "FastSpeech 2: Fast and High-Quality End-to-End Text to Speech". | Simple MNIST training logs |

# Why use Aim?

### Compare runs easily to build models faster

- Compare, group and aggregate 100s of metrics thanks to beautiful visualizations.
- Analyze and learn correlations and patterns between hparams and metrics.
- Easy pythonic search to filter the runs you want to explore.

### Deep dive into details of each run for easy debugging

- Hyperparameters, metrics, images, distributions, audio, text - all available at a glance to understand the performance of your model.
- Easily track plots built via your favourite visualisation tools, like plotly and matplotlib.
- Analyze system resource usage to effectively utilize computational resources.

### Have all relevant information organised and accessible for easy governance

- Centralized dashboard to hollistically view all your runs, their hparams and results.
- Use SDK to query/access all your runs and tracked metadata.
- You own your data - Aim is open source and self hosted.

# Getting started

Follow the steps below to get started with Aim.

**1. Install Aim on your training environment**

```shell
pip3 install aim
```

**2. Integrate Aim with your code**

```python
from aim import Run, Image, Distribution
  
# Initialize a new run
run = Run()

# Log run parameters
run["hparams"] = {
    "learning_rate": 0.001,
    "batch_size": 32,
}

# Log artefacts
for step in range(1000):
    # Log metrics
    run.track(loss_val, name='loss', step=step, context={ "subset": "train" })
    run.track(accuracy_val, name='acc', step=step, context={ "subset": "train" })
  
    # Log images
    run.track(Image(tensor_or_pil, caption), name='gen', step=step, context={ "subset": "train" })

    # Log distributions
    run.track(Distribution(tensor), name='gradients', step=step, context={ "type": "weights" })
```

_See documentation [here](https://aimstack.readthedocs.io/en/latest/quick_start/SDK_basics.html)._

**3. Run the training as usual and start Aim UI**

```shell
aim up
```

**4. Query MD programmatically**

```python
from aim import Repo

my_repo = Repo('/path/to/aim/repo')

query = "metric.name == 'loss'" # Example query

# Get collection of metrics
for run_metrics_collection in my_repo.query_metrics(query).iter_runs():
    for metric in run_metrics_collection:
        # Get run params
        params = metric.run[...]
        # Get metric values
        steps, metric_values = metric.values.sparse_numpy()
```

# Integrations

<details>
<summary>
  Integrate PyTorch Lightning
</summary>

```python
from aim.pytorch_lightning import AimLogger

# ...
trainer = pl.Trainer(logger=AimLogger(experiment='experiment_name'))
# ...
```

_See documentation [here](https://aimstack.readthedocs.io/en/latest/guides/integrations/basic_aim_pytorch_lightning.html)._

</details>

<details>
<summary>
  Integrate Hugging Face
</summary>

```python
from aim.hugging_face import AimCallback

# ...
aim_callback = AimCallback(repo='/path/to/logs/dir', experiment='mnli')
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset if training_args.do_train else None,
    eval_dataset=eval_dataset if training_args.do_eval else None,
    callbacks=[aim_callback],
    # ...
)
# ...
```

_See documentation [here](https://aimstack.readthedocs.io/en/latest/guides/integrations/basic_aim_huggingface.html)._

</details>

<details>
<summary>
  Integrate Keras & tf.keras
</summary>

```python
import aim

# ...
model.fit(x_train, y_train, epochs=epochs, callbacks=[
    aim.keras.AimCallback(repo='/path/to/logs/dir', experiment='experiment_name')
    
    # Use aim.tensorflow.AimCallback in case of tf.keras
    aim.tensorflow.AimCallback(repo='/path/to/logs/dir', experiment='experiment_name')
])
# ...
```

_See documentation [here](https://aimstack.readthedocs.io/en/latest/guides/integrations/basic_aim_keras.html)._

</details>

<details>
<summary>
  Integrate XGBoost
</summary>

```python
from aim.xgboost import AimCallback

# ...
aim_callback = AimCallback(repo='/path/to/logs/dir', experiment='experiment_name')
bst = xgb.train(param, xg_train, num_round, watchlist, callbacks=[aim_callback])
# ...
```

_See documentation [here](https://aimstack.readthedocs.io/en/latest/guides/integrations/basic_aim_xgboost.html)._
</details>

# Comparisons to familiar tools

## Tensorboard
**Training run comparison**

Order of magnitude faster training run comparison with Aim
- The tracked params are first class citizens at Aim. You can search, group, aggregate via params - deeply explore all the tracked data (metrics, params, images) on the UI.
- With tensorboard the users are forced to record those parameters in the training run name to be able to search and compare. This causes a super-tedius comparison experience and usability issues on the UI when there are many experiments and params. TensorBoard doesn't have features to group, aggregate the metrics.

**Scalability**

- Aim is built to handle 1000s of training runs with dozens of experiments each - both on the backend and on the UI.
- TensorBoard becomes really slow and hard to use when a few hundred training runs are queried / compared.

**Beloved TB visualizations to be added on Aim**

- Embedding projector.
- Neural network visualization.

## MLFlow
MLFlow is an end-to-end ML Lifecycle tool.
Aim is focused on training tracking.
The main differences of Aim and MLflow are around the UI scalability and run comparison features.

**Run comparison**

- Aim treats tracked parameters as first-class citizens. Users can query runs, metrics, images and filter using the params.
- MLFlow does have a search by tracked config, but there are no grouping, aggregation, subplotting by hyparparams and other comparison features available.

**UI Scalability**

- Aim UI can handle several thousands of metrics at the same time smoothly with 1000s of steps. It may get shaky when you explore 1000s of metrics with 10000s of steps each. But we are constantly optimizing!
- MLflow UI becomes slow to use when there are a few hundreds of runs.

## Weights and Biases

Hosted vs self-hosted
- Weights and Biases is a hosted closed-source experiment tracker.
- Aim is self-hosted free and open-source.

# Roadmap

## Detailed Sprints

:sparkle: The [Aim product roadmap](https://github.com/orgs/aimhubio/projects/3)

- The `Backlog` contains the issues we are going to choose from and prioritize weekly
- The issues are mainly prioritized by the highly-requested features

## High-level roadmap

The high-level features we are going to work on the next few months

### Done:
  - [x] Live updates (Shipped: _Oct 18 2021_)
  - [x] Images tracking and visualization (Start: _Oct 18 2021_, Shipped: _Nov 19 2021_)
  - [x] Distributions tracking and visualization (Start: _Nov 10 2021_, Shipped: _Dec 3 2021_)
  - [x] Jupyter integration (Start: _Nov 18 2021_, Shipped: _Dec 3 2021_)
  - [x] Audio tracking and visualization (Start: _Dec 6 2021_, Shipped: _Dec 17 2021_)
  - [x] Transcripts tracking and visualization (Start: _Dec 6 2021_, Shipped: _Dec 17 2021_)
  - [x] Plotly integration (Start: _Dec 1 2021_, Shipped: _Dec 17 2021_)
  - [x] Colab integration (Start: _Nov 18 2021_, Shipped: _Dec 17 2021_)
  - [x] Centralized tracking server (Start: _Oct 18 2021_, Shipped: _Jan 22 2022_)
  - [ ] Tensorboard adaptor - visualize TensorBoard logs with Aim (Start: _Dec 17 2021_)
  - [ ] Track git info, env vars, CLI arguments, dependencies (Start: _Jan 17 2022_)

### In progress:
  - [ ] Scikit-learn integration (Start: _Nov 18 2021_)

### TODO:

**Track and Explore**
  - [ ] Models tracking/versioning, model registry
  - [ ] Runs side-by-side comparison

**Data Backup**
  - [ ] Cloud storage support: aws s3, gsc, azure storage

**Reproducibility:**
  - [ ] Collect stdout, stderr logs

**Integrations**
  - [ ] Kubeflow integration
  - [ ] Streamlit integration
  - [ ] Raytune integration
  - [ ] Google MLMD
  - [ ] MLFlow adaptor (visualize MLflow logs with Aim)

# Community

### If you have questions

1. [Read the docs](https://aimstack.readthedocs.io/en/latest/)
2. [Open a feature request or report a bug](https://github.com/aimhubio/aim/issues)
3. [Join our slack](https://slack.aimstack.io/)

### Support Aim

1. Drop a star
2. [placeholder]
