## Aim CLI

Aim CLI offers a simple interface to easily organize and record your experiments. Paired with the Python Library, Aim is
a powerful utility to record, search and compare AI experiments. Here are the set of commands supported:

| Command   | Description                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| `init`    | Initialize the `aim` repository.                                                          |
| `version` | Displays the version of aim cli currently installed.                                      |
| `up`      | Runs Aim web UI for the given repo.                                                       |
| `reindex` | Process runs left in 'in progress' state and optimized finished runs.                     |
| `server`  | Run `aim` remote tracking server accepting incoming RPC requests.                         |
| `runs`    | Manage run data for the given repo.                                                       |
| `convert` | Tool-set for converting 3rd party data into Aim readable format.                          |
| `storage` | Maintain/update Aim repository internal data formats.                                     |

### init

__*This step is optional.*__
Initialize the aim repo to record the experiments.

```shell
$ aim init
```

Creates `.aim` directory to save the recorded experiments to. Running `aim init` in an existing repository will prompt
the user for re-initialization.

| Args                              | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_. |

__*Beware:*__ Re-initialization of the repo clears `.aim` folder from previously saved data and initializes new repo.
__*Note:*__ This command is not necessary to be able to get started with Aim as aim is automatically initializes with
the first aim function call.

### version

Display the Aim version installed.

```shell
$ aim version
```

### up

Start the Aim web UI locally.

```shell
$ aim up [ARGS]
```

| Args                        | Description                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `-h, --host <host>`         | Specify host address.                                                                                            |
| `-p, --port <port>`         | Specify port to listen to. _Default is 43800._                                                                   |
| `--repo <repo_path>`        | Path to parent directory of `.aim` repo. _Current working directory by default_.                                 |
| `--dev`                     | Run UI in development mode—enables hot-reloading only, _not meant for end-users_.                                |
| `--profiler`                | Enables API profiling which logs run trace inside `.aim/profiler` directory.                                     |
| `--log-level`               | Specifies log level for python logging package. _`WARNING` by default, `DEBUG` when `--dev` option is provided_. |


### server

Run a tracking server to collect tracked data from remote clients.

```shell
$ aim server [ARGS]
```

| Args                         | Description                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--repo <repo_path>`         | Path to parent directory of `.aim` repo. _Current working directory by default_.                                 |
| `-h, --host <host>`          | Specify host address.                                                                                            |
| `-p, --port <port>`          | Specify port to listen to. _Default is 53800_.                                                                   |
| `--ssl-keyfile`              | Specify path to keyfile for secure connection.                                                                   |
| `--ssl-certfile`             | Specify path to cert. file for secure connection.                                                                |
| `--dev`                      | Run UI in development mode.                                                                                      |                                
| `--log-level`                | Specifies log level for python logging package. _`WARNING` by default, `DEBUG` when `--dev` option is provided_. |


### runs

Upgrade Aim repository runs data.

```shell
$ aim runs [ARGS] SUBCOMMAND
```

| Args                              | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_. |

__runs subcommands__

| Sub-command | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| `ls`        | List runs in `aim` repository.                                                   |
| `rm`        | Remove run data for given run hashes. At least one run should be specified.      |
| `cp`        | Copy run data for given run hashes. At least one run should be specified.        |
| `mv`        | Move run data for given run hashes. At least one run should be specified.        |
| `upload`    | Create a snapshot of `.aim` directory in cloud. Bucket name should be specified. |

Global expression (`*`) support is available for run hashes. If hash contains `*`, it must be enclosed within
quotes (`''`) as bash resolves the expression before passing it to `aim runs` command.

```shell
$ aim runs ls
```

```shell
$ aim runs rm [HASH] ...
```

```shell
$ aim runs cp [ARGS] [HASH] ...
```

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--destination <dest_repo_path>`  | Path to destination repo. __Required.__                   |

```shell
$ aim runs mv [ARGS] [HASH] ...
```

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--destination <dest_repo_path>`  | Path to destination repo. __Required.__                   |

```shell
$ aim runs upload [ARGS] ...
```

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--bucket <bucket_name>`          | Name of the  cloud storage bucket. __Required.__          |


### convert

Tool-set for converting 3rd party data into Aim readable format.

```shell
$ aim convert [ARGS] SUBCOMMAND
```

| Args                              | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_. |

**convert subcommands**

| Sub-command   | Description                     |
| ------------- | ------------------------------- |
| `tensorboard` | Convert from Tensorboard logs.  |
| `mlflow`      | Convert from MLFlow logs.       |

**Sub-command: tensorboard**

| Options       | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `--flat`      | Disregard context directory and treat them as distinct run directories. Inactive by default. |
| `--no-cache`  | Ignore previously cached results and process the logs entirely. Disabled by default.         |

**Sub-command: mlflow**

| Options                               | Description                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `--tracking_uri` <logs_uri>           | MLFlow logs URI. Can be either an HTTP/HTTPS URI for a remote server, a database connection string, or a local path. |
| `-e` &#124; `--experiment` <exp_name> | MLFlow Experiment name. If specified, only runs for `exp_name` will be converted.                                    |

### storage

Perform various maintenance operations on Aim repository.

```shell
$ aim storage [ARGS] SUBCOMMAND
```

| Args                   | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| `--repo <repo_path>`   | Path to parent directory of `.aim` repo. _Current working directory by default_. |

__storage subcommands__

| Sub-command      | Description                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `upgrade 3.11+`  | Update metric sequence data format for given runs. At least one run should be specified. |
| `restore`        | Rollback `Run` to old metric format if run backup is available.                          |
| `reindex`        | Update index to include all runs in Aim repo which are left in progress.                 |
| `prune`          | Remove dangling params/sequences with no referring runs.                                 |


**Sub-command: update 3.11+**

```shell
$ aim storage upgrade 3.11+ [HASH] ...
```

**Sub-command: restore**

```shell
$ aim storage restore [HASH] ...
```

**Sub-command: reindex**
| Args                  | Description                                                                      |
| --------------------- | ---------------------------------------------------------------------------------|
| `--finalize-only`     | Only finalize runs left in 'in progress' state. Do not attempt runs optimization.|

**Sub-command: prune**

```shell
$ aim storage prune 
```

## Aim status watcher CLI

Aim status CLI offers an interface to start training runs status monitoring and configure
how the notifications should be received. The entry point to this CLI is `aim-watcher`:

```shell
$ aim-watcher [ARGS] SUBCOMMAND
```

| Args                  | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| `--repo <repo_path>`  | Path to parent directory of `.aim` repo. _Current working directory by default_. |


| Sub-Commands| Description                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| `start`     | Start watcher service to monitor and report stuck/failed Runs.                                                          |
| `notifiers` | Configure how notifications should be received.                                      |


### start
Start watcher service for the given aim `Repo`.
```shell
aim-watcher --repo . start
```

### notifiers

Manipulate notifiers configuration.

__notifiers subcommands__

| Sub-command | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| `add`       | Add a new notifier configuration (slack, workplace, etc.).                       |                           |
| `list`      | List available notifiers                                                         |
| `remove`    | Remove notifier configuration from the list.                                     |
| `disable`   | Stop receiving notifications from given notifier.                                |
| `enable`    | Start receiving notifications from given notifier.                               |

```shell
$ aim-watcher notifiers add
```

```shell
$ aim-watcher notifiers list
```

```shell
$ aim-watcher notifiers remove [NOTIFIER_ID]
```

```shell
$ aim-watcher notifiers disable [NOTIFIER_ID]
```

```shell
$ aim-watcher notifiers enable [NOTIFIER_ID]
```
