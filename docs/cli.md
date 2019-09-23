# Command Line Interface

Reference for the aim cli features.

## CLI Specs

List of the commands supported by the aim cli


### Aim Deploy

Command:
``` shell
aim-deploy -m <checkpoint_file> -n <image_name> -v <version>

```
Deploys the given `.aim` model file with the given image name as a docker container which serves the model as HTTP server.
