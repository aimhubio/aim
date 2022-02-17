## Storage indexing - how Aim data is indexed

### Background

When tracking experiment metadata with Aim, each run creates its own isolated space in
aim repository. This allows to run multiple concurrent experiments without setting-up additional
services responsible for data writes synchronization. Once run is complete, all the data it 
tracked is being indexed. We call this step run finalization. When the training script terminated
with `SIGTERM` signal, Aim will handle this and make sure that run properly finalized and data is
indexed. However, there are cases when training terminated abnormally and data remains unindexed.

### How things worked before?

Due to the chunks of data being unindexed, chunks of data would remain in the runs' separate
storage but not in index storage. This means that queries had to open multiple files to read the
repo data. Once failed runs started to accumulate, queries will slow down. In order to mitigate this
`aim reindex` [command](../refs/cli.html#reindex) has been introduced.
The command will scan the aim repo and index all stalled runs.

### Automatic indexing

Though `aim reindex` command will address the performance issues it is not the most convenient
way to do. The questions such as "When should I run `aim reindex`?" or "How frequent should I run `aim reindex`?" depend on the actual
aim repository and use-case. Thus, we need to automate the indexing of aim repository.
Each time `aim up` command is ran, Aim will spawn a background thread along with the web server.
The thread will check for the unindexed runs and reindex them one at the time. This will keep
queries performance high without locking the index storage for too long.

### Conclusion
With the new automatic indexing logic in place, users don't have to manually run `aim reindex`
command. It is still in place for cases when all the runs data should be indexed at once. The 
combination of automatic (implicit) and manual (explicit) reindexing makes sure aim repo has
good performance in a long-term usage screnarios and provides good overall user experience.