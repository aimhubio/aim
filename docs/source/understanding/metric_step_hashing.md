## Storing Metric sequence data for fast access

### Background

Aim allows tracking metric sequences without any limitation of the number of steps tracked.
With a few thousands of steps per metric it is OK to load the entire sequence into memory
and slice it to get the desired number of points. However, when many (tens of millions) steps are tracked,
this approach cannot be applied.
Starting from version `3.11` Aim metric sequence data format has changed to improve the
data collection/sampling performance for long sequences.

### What has changed?

Each value tracked has its unique key in the Run's `rocksdb` database. Previously 
the tracking step has been used as the part of this key. This means that in order to get
the sample of K values we have to either do K random access operations or iterate over
entire sequence and skip values. Both have negative implication on data read performance.
With Aim `3.11` the key uses the stable random hashing algorithm instead of tracking step.
Since the keys are sorted, reading first K keys is a good approximation for the entire
metric sequence. 

### What to do if the Metric has been logged already?

In order to speed-up the metrics read for existing aim `Repo`s the data format upgrade
should be executed. In cases when `Run` has been opened for write, the upgrade is done
automatically, since it is not possible to mix two formats.
For the rest of the cases new CLI command has been added to apply data format change
for selection of `Run`s or for the entire repo:

```shell
# update selected list of runs
aim storage upgrade 3.11+ <RUN_HASH_1> <RUN_HASH_2> ...

# update all runs in the repo
aim storage --repo <REPO_PATH> upgrade 3.11+ '*' 
```

The `Run` data backup with old format is available in case of any issues. In order to rollback format
change and get back to the old format run the following command:

```shell
aim storage restore <RUN_HASH>
```
