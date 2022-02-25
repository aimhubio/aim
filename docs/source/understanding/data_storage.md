## Data storage - where Aim data is collected

This section provides a deep-dive into Aim storage structure. It is important
to know the internal storage organization in order to understand how it affects
queries performance.

### Storage structure
The core foundation for Aim storage is [rocksdb](http://rocksdb.org/docs/getting-started.html). It is a fast, embedded key-value
store maintained by facebook. The aim repository is a collection of individual
rocksdb databases with abstraction layers added to manage the collection as one database. The abstraction of
a single KV store called `Container`. Below is the directory structure for a typical Aim project:
```shell
.aim
    run_metadata.sqlite
    meta/
        index/
        chunks/
            aacf48e769534c32a9cc5a3c/
            80483ab611a24bf5bd8fc288/
            16f83a2c2f50477f8446f322/
        progress/
            aacf48e769534c32a9cc5a3c
            80483ab611a24bf5bd8fc288
        locks/
            aacf48e769534c32a9cc5a3c
            80483ab611a24bf5bd8fc288
    seqs/
        chunks/
            aacf48e769534c32a9cc5a3c/
            80483ab611a24bf5bd8fc288/
            16f83a2c2f50477f8446f322/
        progress/
            aacf48e769534c32a9cc5a3c
            80483ab611a24bf5bd8fc288
        locks/
            aacf48e769534c32a9cc5a3c
            80483ab611a24bf5bd8fc288
``` 

There are two main parts of the storage: 
- `run_metadata.sqlite`: SQLite database for storing `Run` structured data, such as, creation time, 
  name, `Experiment` it is attached to, `Tag`s etc.
- `meta/` and `seqs/` directories: a collection of rocksdb storages. Used to write `Run`s tracked 
  data, such as params, metrics and objects.

In the tree above the hash-strings (i.e. `aacf48e769534c32a9cc5a3c`) represent a single `Run`.
When the new `Run` is started, aim will create two Containers:
- **Meta** container for logged params as well as metadata about collected sequences, contexts, etc.
- **Sequence** container for the value series.

The reason the actual sequence data separated from metadata is the necessity for fast queries, regardless
sequence size.

Additionally, per each container two files will be created to properly manage the container state
  
- **lock** file, indicating that the container opened in write-mode.
- **progress** file, indicating that container potentially has un-indexed data.

This setup allows implementing concurrent training jobs setup without requiring additional synchronization
routines, and without the risk of losing or corrupting the data. For example, two jobs might run on different hosts where aim repo mounted on a shared NFS location.


### What is the index container?
Each run writes data into its own isolated containers. The aim queries require reading
the Run metadata from **meta** container. However, with 1000s of runs opening each meta container database will slow-down
the queries. Here the indexing of metadata becomes crucial.

`Run` object maintains lock for both **meta** and **sequence** containers during the training script execution. Run will
continue to write its data into its own containers. Once the execution finishes, **meta** container data indexed, 
the container locks released, and the progress file removed. The **sequence** container data is not indexed, since the
individual points of a sequence are not queryable, and the sequence info is available in **meta** container.

### How data written to/read from the storage?
`Run` object provides interface for logging the Run parameters dict-like data and tracking series of scalars
and objects. Aim has a custom encoding layer which translates this hierarchical data into the sets of key-value
pairs to be written into rocksdb. The same encoding layer is responsible for re-constructing the tracked data/objects.
During query execution, aim SDK will walk through all runs in `index` container + the **meta** containers for chunks which
have progress file (remember that progress file indicates potentially un-indexed data for the Run). If the run/sequence
match the query expression, the appropriate run/sequence will be yielded. Notice that till this point no data was accessed
from the **sequence** container. The sequence data itself is read upon request.
