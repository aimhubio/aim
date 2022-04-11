## Aim Remote Storage

### Overview

The majority of the data tracked by Aim can be stored inplace within the Aim repository. Such approach allows
reducing latency while reading the data or querying objects. In addition to storing the training runs metadata,
hyperparameters and tracking metrics, Aim provides ability to track objects, such as images, audio files, etc.
However, the size of the storage will grow depending on a number of tracked objects and their size, and may eventually
not fit on a local storage. In order to offload the local storage, Aim provides ability to specify artifact storage
URL which can be used to store large binary blobs. Example of such blobs are model checkpoints, datasets, etc.
Aim supports cloud-based storage such as [S3](https://docs.aws.amazon.com/s3/index.html) and 
[GCS](https://cloud.google.com/storage/docs).
In addition to the cloud-based storage, the artifact storage class `local` is also available.
The artifact storage `local` can be used to move rarely accessed data to less performant but cheaper disk space 
such as HDD, and save some space on SSDs. Additionally, local storage class can be used for testing and debugging.

**Note.** _Most of the space used by Aim can be offloaded to the cloud storage. This can include the large blobs, 
as well as contents of tracked files. However, it is important to know that Aim still utilizes local storage to keep 
the training runs metadata, hyperparameters and metrics. This allows to run Aim with minimal impact on performance
of queries and UI._


### Selecting the artifact storage

In order to store the data in cloud storage the artifact storage URL must be specified as an argument to aim `Run`
`Repo` initialization. The storage class (S3, GCS, local) is automatically determined based on a URL scheme. Below are
some examples for creating aim Run object with artifact storage:
```python
from aim import Repo, Run

# create Run with artifact storage at S3 bucket "my-bucket"
run = Run(artifact_path='s3://my-bucket/aim_logs/')

# create Repo with artifact storage at S3 bucket "my-bucket"
repo = Repo.from_path('/home/aim_user/my_repo', artifact_path='s3://my-bucket/aim_logs/')

# create a Run with the same artifact storage as for the Repo
run = Run(repo=repo)


# try to create a second Run with a different artifact storage
run2 = Run(repo=repo, artifact_path='s3://other-bucket/aim_logs/')  ## ERROR
```

**Note.** _The artifact storage must be the same for all_ `Run` _objects of the same_ `Repo`.
_The_ `artifact_path` _argument is optional. If not specified, the directory at_ `<AIM_REPO_PATH>/.aim/artifacts`
_will be created and used as a local artifact storage._

### Logging artifacts with Aim

Starting from version `3.9.0` Aim provides two new objects: `File` and `Directory`. These classes can be used
to upload the artifacts to cloud-based storage and log their metadata to Aim. The `File` object accepts a single 
input argument which can be either file path, in-memory `bytes` or bytes stream. The `Directory` objects
takes a directory path as an input and optional argument to include/exclude hidden files during upload.

```python
from aim import Run, File, Directory

...
run = Run(artifact_path='s3://my-bucket/aim_logs/')
for artifact_name, artifact_path in artifacts_dict.items():
    run['artifacts', artifact_name] = File(artifact_path)
    
run['artifacts', 'directories', 'without_hidden'] = Directory('/path/to/logged/directory')
run['artifacts', 'directories', 'with_hidden'] = Directory('/path/to/logged/directory', skip_hidden=False)
...
```

In order to minimize the data traffic and occupied storage, the multiple copies of a `File` object will share the
contents in artifact storage as long as they attached to the same `Run`.

```python
...
run = Run(artifact_path='s3://my-bucket/aim_logs/')
file = File('/path/to/file') 
run['artifacts', 'file_1'] = file  # upload to S3
run['artifacts', 'file_1_copy'] = file  # no upload file is already uploaded
file2 = file
run['artifacts', 'file2'] = file2  # still no uploads

other_file = File('/path/to/other_file')
run['artifacts', 'other_file'] = other_file  # upload 2nd file to S3

run2 = Run(artifact_path='s3://my-bucket/aim_logs/')
run2['artifacts', 'other_file'] = other_file  # upload to S3 for 2nd Run
...
```

### Moving aim built-in objects blob data to cloud storage

By default, the binary data blobs for Aim objects such as `Image`, `Audio`, `Figure`, `Text` and 
`Distribution` are embedded into the Aim storage. This behavior can be changed, however, to
opt for disk space vs. load latency. In order to store data blobs in external artifact
storage, the following environment variable must be set

```bash
export __AIM_USE_EXTERNAL_BLOBS__=1
```

Once set, modify your training script to provide the artifact storage URL to `Run` object

```python
from aim import Run

aim_run = Run(artifact_path=ARTIFACT_STORAGE_URL)
...
```

### Running Aim UI with artifact storage

In order to specify the artifact storage for Aim UI run the following command line

```bash
aim up --repo <AIM_REPO_PATH> --artifacts <AIM_ARTIFACTS_URL>
```

If the artifact storage URL is different from one provided during training run, warning
message will be shown in terminal once you try to read the data.

```bash
Missing data at 'image/2022.04.08-07:16/22b601ea420f48dd-image' for storage 's3://my-bucket/aim_logs/'. Skipping.
Missing data at 'image/2022.04.08-07:16/e3964dabed9344d0-image' for storage 's3://my-bucket/aim_logs/'. Skipping.
```

### Retrieving logged artifacts via SDK

Once uploaded to the cloud storage, Aim artifacts can be retrieved from `Run` and
downloaded. This feature can be used to continue interrupted training based on model
checkpoint logged as a `File` artifact.

```python
from aim import Repo

repo = Repo.from_path('/aim/repo/path')
run = repo.get_run(RUN_HASH)

model_checkpoint = run['model']
model_checkpoint.download('/path/to/model')
model.load('/path/to/model')
...
```