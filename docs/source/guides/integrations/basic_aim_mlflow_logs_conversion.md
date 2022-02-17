### Show MLflows logs in Aim

Aim gives your possibility to convert [MLflow](https://mlflow.org/) runs into native format and show them directly
inside the Aim interface.

Before showing your MLlfow runs in Aim, they need to pass conversion process where your metrics, tags, parameters, run
description/notes and *some* artifacts will be transferred into Aim storage and shown inside Aim web interface.

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

* Sounds/Audios: `(
  'flac',
  'mp3',
  'wav'
  )`

To convert MLflow runs, `aim convert mlflow` command must be run on your log directory:

```commandline
$ aim init
$ aim convert mlflow --tracking_uri 'file:///Users/aim_user/mlruns'
```

The conversion process will iterate over all your Experiments and create a distinct run for each run inside the
experiment. If you want to process only a single experiment, you can provide the experiment id to the conversion
command:

```commandline
$ aim convert mlflow --tracking_uri 'file:///Users/aim_user/mlruns' --experiment 0
```

While converting the artifacts, the converter will try to determine file content type only based on its extension. A
warning message will be issued if artifact cannot be categorized, these artifacts will not be transferred to aim!
Please check the command output logs if you fail to see your artifact in Aim's web.

If you believe there is an issue with this conversion process
please [open an issue](https://github.com/aimhubio/aim/issues/new/choose).

Once conversion process is complete - you can enjoy the power of Aim 🚀