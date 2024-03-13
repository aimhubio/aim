##  Logging artifacts with Aim

One of the key aspects of experiment tracking is the ability to link certain
files/artifacts to the training run metadata. Examples of such artifacts are the
model checkpoints, training run configuration files, etc.

Starting from the version 3.19, Aim provides the logging API for artifacts, and the
UI for showing artifact's metadata.

### Artifacts logging SDK

There are only two steps for logging artifacts with Aim:
1. Set the artifacts storage URI for the Aim Run:
```python
import aim

run = aim.Run()
# Use S3 as artifacts storage
run.set_artifacts_uri('s3://aim/artifacts/')
```
Aim will create directory with the name of `run.hash` and store all artifacts there. 
Note that setting artifacts storage URI is required only once per run.
2.  Log artifact object:
```python
# Log run configuration files as artifacts
run.log_artifact('config.yaml', name='run-config')
```

Once logged, artifact metadata will appear in the Aim UI Run details page:
![](../_static/images/ui/run_details/run-overview-artifacts.png)


### Storage backends

Training artifacts may represent large files, and, depending on the use case, might require
different storage backends. For example, in case of small runs using the local file system,
or network shared FS might be a good option. In case of the large models, cloud-based object
stores, such as AWS S3, may be a better choice.

When the artifacts URI is set, Aim will detect storage backend based on the URI scheme.
Currently, S3 is the only supported backend for artifacts storage.

#### S3 Artifacts Storage Backend

Aim uses `boto3` Python package for accessing AWS resources. No additional credentials
validation os done on the Aim side. More details on how credentials configuration is done
for `boto3` is available [here](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html).