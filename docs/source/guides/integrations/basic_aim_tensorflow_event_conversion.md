### Show TensorFlow events in Aim 

Aim gives your possibility to convert TensorFlow event files into native format 
and show them directly inside the Aim interface.

Before showing the events in aim, the event files have to pass 
the conversion process.

Please note that only the following TF plugins are currently supported 
- scalar
- image

To convert TensorFlow events, `aim convert` command must be run on your log directory.

```commandline
aim convert tf --logdir ~/tensorflow/logdir
```

To make conversion process smooth please ensure that logs directory structure follows conventions below.
Consider the following directory hierarchy:

```
~/tensorflow/logdir/
    ├> run_1/
    │    ├> <tf_events_file_1>
    │    └> <tf_events_file_2>
    ├> group_1/
    │    ├> <tf_events_file_3> (THIS EVENT WILL BE IGNORED)
    │    ├> run_2/
    │    │    ├> train/
    │    │    │    ├> <tf_events_file_4>
    │    │    │    └> <tf_events_file_5>
    │    │    ├> validate/
    │    │    │    ├> <tf_events_file_6>
    │    │    │    └> <tf_events_file_7>
    │    │    ├> <tf_events_file_8> (IGNORED IF "--flat" IS ACTIVE)
    │    │    └> <tf_events_file_9> (IGNORED IF "--flat" IS ACTIVE)
    │    └> run_3/
    │        ├> <tf_events_file_10>
    │        └> <tf_events_file_11>
    ├> <tf_events_file_12> (THIS EVENT WILL BE IGNORED)
    └> <tf_events_file_13> (THIS EVENT WILL BE IGNORED)
```

Note that directory naming is not mandated and its up to you how to name them.

The conversion logic categorizes your hierarchy into one of `group`, `run` and `context`
categories where.
- group: Is a directory which has one or more run directories inside it,
- run: Is a directory which has either event files or context directory inside it,
- context: Is a directory inside of run directory which has an event file inside it.

Conversion process will scan and determine `run` directories for your hierarchy
and will create a distinct run for each of them.

From the hierarchy example above you can see that the following event files
will be ignored since the converter treats them as unorganized event files.
- `<logidr>/group_1/tf_events_file_3`
- `<logdir>/tf_events_file_12`
- `<logdir>/tf_events_file_13`

All other events will either have `Context` or `No Context`.
Context of the event is the name of the parent directory if
the parent directory hasn't been categorized into neither as `run` nor `group` category.

For example:
- Events right underneath `run_1`, `run_2` and `run_3` will have no context
- Events under `run_2/train` and `run_2/validate` will have `train` and `validate` as context accordingly.

In case the converter finds unorganized event files in your hierarchy a warning message will be issued.

To make the converter process these events, consider re-structuring your directories so that it matches
the sample structure. (i.e. create a new directory and moving your unorganized events there)

You can make converter treat every directory as a distinct run by supplying `--flat` option.
In this case the following directories will be categorized as a `run` directory.

- `~/tensorflow/logdir/run_1/`
- `~/tensorflow/logdir/group_1/run_2/train/`
- `~/tensorflow/logdir/group_1/run_2/validate/`
- `~/tensorflow/logdir/group_1/run_3/`

The event files in all other directories will be ignored.