# Troubleshooting for Aim

This is a collection of scripts and utilities to run over an Aim repo to collect unanimous information for debugging and reproducibility purposes.

## Base Project Stats

The `troubleshooting.base_project_statistics` script is a utility to collect and analyze statistics from **AIM repo**.
It provides a report with base stats: the number of runs, metrics, and query times.
Query time samples are collected by running sample basic queries.

The output of the script is a JSON file containing the statistics.

### How to Use the Command

**Step 1:** Download the `base_project_statistics.py` is in your working directory.
**Step 2:** Execute the script on the repo of interest

```bash
wget https://raw.githubusercontent.com/aimhubio/aim/main/troubleshooting/base_project_statistics.py
python -m base_project_statistics --repo <path_to_repo>

```
The command generates a JSON file in the current working directory, containing statistics about the repository.

### Example JSON Output

A typical output file contains the following information:

```json
{
  "runs_count": 19,
  "unindexed_runs_count": 3,
  "metrics_count": 323,
  "avg_metrics_per_run": 17.0,
  "max_metrics_per_run": 17,
  "avg_params_per_run": 224.58,
  "max_params_per_run": 225,
  "runs_query_time": 0.036,
  "metrics_query_time": 15.7
}
```

### Key Fields

- `runs_count`: Total number of runs in the repository.
- `unindexed_runs_count`: Number of runs that are not indexed.
- `metrics_count`: Total count of metrics across all runs.
- `avg_metrics_per_run`: Average number of metrics per run.
- `max_metrics_per_run`: Maximum number of metrics in a single run.
- `avg_params_per_run`: Average number of parameters per run.
- `max_params_per_run`: Maximum number of parameters in a single run.
- `runs_query_time`: Time taken to query runs, in seconds.
- `metrics_query_time`: Time taken to query metrics, in seconds.
