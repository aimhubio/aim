## Aim CLI

Aim CLI offers a simple interface to easily organize and record your experiments.
Paired with the Python Library, Aim is a powerful utility to record, search and compare AI experiments.
Here are the set of commands supported:


| Command       | Description                                                          |
| --------------| -------------------------------------------------------------------- |
| `init`        | Initialize the `aim` repository.                                     |
| `version`     | Displays the version of aim cli currently installed.                 |
| `up`          | Runs Aim web UI for the given repo.                                  |
| `upgrade`     | Upgrades legacy Aim repository from `2.x` to `3.0`.                  |
| `reindex`     | Process runs left in 'in progress' state and optimized finished runs.|
| `server`      | Run `aim` remote tracking server accepting incoming RPC requests. _Experimental feature._|
| `runs`        | Manage run data for the given repo.                                  |

### init
__**This step is optional.**__
Initialize the aim repo to record the experiments.
```shell
$ aim init
```
Creates `.aim` directory to save the recorded experiments to.
Running `aim init` in an existing repository will prompt the user for re-initialization.

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_ |


  **_Beware:_** Re-initialization of the repo clears `.aim` folder from previously saved data and initializes new repo.
  **_Note:_** This command is not necessary to be able to get started with Aim as aim is automatically initializes with the first aim function call.

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

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `-h` &#124; `--host <host>`       | Specify host address.                                     |
| `-p` &#124; `--port <port>`       | Specify port to listen to.                                |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_ |
| `--dev`                           | Run UI in development mode.                                   |

### upgrade
Upgrade Aim repository containing data logged with older version of Aim.
```shell
$ aim upgrade [ARGS] SUBCOMMAND
```

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_ |

**upgrade subcommands**

Upgrade `aim` repository from `2.x` to `3.0`.
```shell
$ aim ugrade 2to3 [ARGS]
```

| Args                  | Description                                                          |
| ----------------------| -------------------------------------------------------------------- |
| `--skip-failed-runs`  | Use this flag to skip runs which are failed/have missing or incomplete data. |
| `--skip-checks`       | Use this flag to skip new repository consistency checks. |
| `--drop-existing`     | Use this flag to clear old `.aim` directory. By default old data is kept in `.aim_legacy`.|

### reindex
Update index to include all runs in Aim repo which are left in progress.
```shell
$ aim reindex [ARGS]
```

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_ |
| `--finalize-only`                 | Only finalize runs left in 'in progress' state. Do not attempt runs optimization. |

### server
Run a gRPC server to collect tracked data from remote clients.
```shell
$ aim server [ARGS]
```

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_ |
| `-h` &#124; `--host <host>`       | Specify host address.                                     |
| `-p` &#124; `--port <port>`       | Specify port to listen to. _Default is 53800_             |
| `-w` &#124; `--workers <N>`       | Specify number of gPRC workers. _Default is 1 worker.     |
| `--ssl-keyfile`                   | Specify path to keyfile for secure connection.            |
| `--ssl-certfile`                  | Specify path to cert. file for secure connection.         |

### runs
Upgrade Aim repository runs data.
```shell
$ aim runs [ARGS] SUBCOMMAND
```

| Args                              | Description                                               |
| --------------------------------- | --------------------------------------------------------- |
| `--repo <repo_path>`              | Path to parent directory of `.aim` repo. _Current working directory by default_ |

**runs subcommands**

| Sub-command   | Description                                                          |
| --------------| -------------------------------------------------------------------- |
| `ls`        | List runs in `aim` repository.                                         |
| `rm`        | Remove run data for given runs hashes. At lease one run should be specified|


```shell
$ aim runs ls
```

```shell
$ aim runs rm [HASH] ...
```
