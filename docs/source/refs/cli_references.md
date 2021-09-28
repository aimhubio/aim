## Command Line Interface

Aim CLI offers a simple interface to easily organize and record your experiments.
Paired with the [Python Library](#sdk-specifications), Aim is a powerful utility to record, search and compare AI experiments.
Here are the set of commands supported:


| Command       | Description                                                          |
| --------------| -------------------------------------------------------------------- |
| `init`        | Initialize the `aim` repository.                                     |
| `version`     | Displays the version of aim cli currently installed.                 |
| `experiment`  | Creates a new experiment to group similar training runs into.        |
| `up`          | Runs Aim web UI for the given repo                                   |

### init
__**This step is optional.**__
Initialize the aim repo to record the experiments.
```shell
$ aim init
```
Creates `.aim` directory to save the recorded experiments to.
Running `aim init` in an existing repository will prompt the user for re-initialization.

  **_Beware:_** Re-initialization of the repo clears `.aim` folder from previously saved data and initializes new repo.
  **_Note:_** This command is not necessary to be able to get started with Aim as aim is automatically initializes with the first aim function call.

### version
Display the Aim version installed.
```shell
$ aim version
```

### experiment
Create new experiments to organize the training runs. Here is how it works:
```shell
$ aim experiment COMMAND [ARGS]
```
| Command    | Args                            | Description                                               |
| -----------| ------------------------------- | --------------------------------------------------------- |
| `add`      | `-n` &#124; `--name <exp_name>` | Add new experiment with a given name.                     |
| `checkout` | `-n` &#124; `--name <exp_name>` | Switch/checkout to an experiment with given name.         |
| `ls`       |                                 | List all the experiments of the repo.                     |
| `rm`       | `-n` &#124; `--name <exp_name>` | Remove an experiment with the given name.                 |

***Disclaimer:*** Removing the experiment also removes the recorded experiment runs data.

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
| `--tf_logs <logs_dir_path>`       | Use Aim to search and compare TensorBoard experiments. More details in [TensorBoard Experiments](#tensorboard-experiments) |
| `--dev`                           | Run UI in development mode.                                   |

***Please make sure to run `aim up` in the directory where `.aim` is located.***

Jump to [[Getting Started](#getting-started-in-3-steps)] [[Overview](#overview)] [[Use Cases](#use-cases)]
