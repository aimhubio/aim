## Migrate from other tools

The Aim explorers add true superpowers to the AI engineer's arsenal. However not all training runs may have been tracked
by Aim. So it is important to be able to port existing training run logs. There might be 1000s of training runs tracked
with other tools. Aim has built-in converters to easily migrate logs from other tools. These migrations cover the most
common usage scenarios. In case of custom and complex scenarios you can use Aim SDK to implement your own conversion
script.

As of Aim `v3.6.0` the following converters are supported:

- [TensorBoard logs converter](#show-tensorboard-logs-in-aim)
- [MLFlow logs converter](#show-mlflow-logs-in-aim)
- [Weights & Biases logs converter](#show-weights-and-biases-logs-in-aim)

We are working to constantly improve existing converters and implement new ones.

### Show TensorBoard logs in Aim

Aim gives you a possibility to convert [TensorBoard](https://www.tensorflow.org/tensorboard)
logs into native format and show them directly inside the Aim UI.

Before showing the logs in Aim, the files have to pass the conversion process.

Please note that only the following plugins are currently supported

- scalar
- image

To convert TensorBoard logs, `aim convert` command must be run on your log directory.

```shell
aim convert tensorboard --logdir ~/my_logdir
```

To make conversion process smooth please ensure that logs directory structure follows conventions below. Consider the
following directory hierarchy:

```
~/my_logdir/
    ├> run_1/
    │    ├> <evnet_file_1>
    │    └> <evnet_file_2>
    ├> group_1/
    │    ├> <evnet_file_3> (THIS LOG WILL BE IGNORED)
    │    ├> run_2/
    │    │    ├> train/
    │    │    │    ├> <evnet_file_4>
    │    │    │    └> <evnet_file_5>
    │    │    ├> validate/
    │    │    │    ├> <evnet_file_6>
    │    │    │    └> <evnet_file_7>
    │    │    ├> <evnet_file_8> (IGNORED IF "--flat" IS ACTIVE)
    │    │    └> <evnet_file_9> (IGNORED IF "--flat" IS ACTIVE)
    │    └> run_3/
    │        ├> <evnet_file_10>
    │        └> <evnet_file_11>
    ├> <evnet_file_12> (THIS LOG WILL BE IGNORED)
    └> <evnet_file_13> (THIS LOG WILL BE IGNORED)
```

Note that directory naming is not mandated and its up to you how to name them.

The conversion logic categorizes your hierarchy into one of `group`, `run` and `context`
categories where.

- group: Is a directory which has one or more `run` directories inside it,
- run: Is a directory which has either log files or context directory inside it,
- context: Is a directory inside of `run` directory which has at least one log file inside it.

Conversion process will scan and determine `run` directories for your hierarchy and will create a distinct run for each
of them.

From the hierarchy example above you can see that the following log files will be ignored since the converter treats
them as unorganized log files.

- `~/my_logdir/group_1/evnet_file_3`
- `~/my_logdir/evnet_file_12`
- `~/my_logdir/evnet_file_13`

All other logs will either have `Context` or `No Context`. Context of the log is the name of the parent directory if
the parent directory hasn't been categorized into neither as `run` nor `group` category.

For example:

- Log files right underneath `run_1`, `run_2` and `run_3` will have no context
- Log files in `run_2/train` and `run_2/validate` will have `train` and `validate` as context accordingly.

In case the converter finds unorganized log files in your hierarchy a warning message will be issued.

To make the converter process these logs, consider re-structuring your directories so that it matches the sample
structure. (i.e. create a new directory and moving your unorganized logs there)

You can make converter treat every directory as a distinct run by supplying `--flat` option. In this case the following
directories will be categorized as a `run` directory.

- `~/my_logdir/run_1/`
- `~/my_logdir/group_1/run_2/train/`
- `~/my_logdir/group_1/run_2/validate/`
- `~/my_logdir/group_1/run_3/`

The log files in all other directories will be ignored.

### Show MLflow logs in Aim

Aim gives you a possibility to convert [MLflow](https://mlflow.org/) runs into native format and show them directly on
Aim UI.

Before showing your MLlfow runs on Aim, they need to pass conversion process where your metrics, tags, parameters, run
description/notes and *some* artifacts will be transferred into Aim storage.

Please note that as for now, only the artifacts having the following file extensions will be transferred into Aim
storage!

* Images: `(
  'jpg',
  'bmp',
  'jpeg',
  'png',
  'gif',
  'svg'
  )`

* Texts: `(
  'txt',
  'log',
  'py',
  'js',
  'yaml',
  'yml',
  'json',
  'csv',
  'tsv',
  'md',
  'rst',
  'jsonnet'
  )`

* Sound/Audios: `(
  'flac',
  'mp3',
  'wav'
  )`

To convert MLflow runs, `aim convert mlflow` command must be run on your log directory:

```commandline
$ aim init
$ aim convert mlflow --tracking_uri 'file:///Users/aim_user/mlruns'
```

You can also set the `MLFLOW_TRACKING_URI` environment variable to have MLflow find a URI from there. In both cases, the
URI can either be an HTTP/HTTPS URI for a remote server, a database connection string, or a local path to log data to a
directory.

The conversion process will iterate over all your Experiments and create a distinct run for each run inside the
experiment. If you want to process only a single experiment, you can provide the experiment id or name to the conversion
command:

```commandline
$ aim convert mlflow --tracking_uri 'file:///Users/aim_user/mlruns' --experiment 0
```

While converting the artifacts, the converter will try to determine file content type only based on its extension. A
warning message will be issued if artifact cannot be categorized, these artifacts will not be transferred to aim!
Please check the command output logs if you fail to see your artifact in Aim's web.

### Show Weights and Biases logs in Aim

Aim gives you a possibility to convert [Weights & Biases](https://wandb.ai/site) runs into native format and explore them via Aim UI.

To be able to explore Weights & Biases runs with Aim, please run the WandB to Aim converter. All the metrics, tags, config, experiment description/notes and *some* artifacts will be converted and stored in `.aim` repo.

Execute `aim convert wandb` command to start converting Weights & Biases experiments:

```commandline
$ aim init
$ aim convert wandb --entity 'my_team' --project 'test_project'
```

The convertor will iterate over all the experiments and create a distinct Aim run for each experiment. If you want to process only a single experiment, please specify the experiment id or name when running the command:

```commandline
$ aim convert wandb --entity my_team --project test_project --run-id '<HASH_OF_RUN>'
```

While converting the artifacts, the converter will try to determine file content type based on its extension. A
warning message will be issued if artifact will not be categorized, these artifacts will not be transferred to aim.
Please note that current implementation tracks only the primitive datatypes.

If there are any issues with the conversion process, please [submit an issue](https://github.com/aimhubio/aim/issues/new/choose).

Once conversion process is complete - you can enjoy the power of Aim 🚀
