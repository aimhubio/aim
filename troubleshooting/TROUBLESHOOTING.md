# Troubleshooting for Aim

This is a collection of scripts and utilities to run over an Aim repo to collect unanimous information for debugging and reproducibility purposes.

## Base Project Stats

The `troubleshooting.base_project_statistics` script is a utility to collect and analyze statistics from a specified **AIM repo**.
It provides a detailed JSON report with stats such as the number of runs, metrics, and query times, enabling efficient troubleshooting and performance analysis.
The command processes the repository at the given path and generates a JSON file containing statistics.

## How to Use the Command

1. **Download the script**:  
   Ensure `base_project_statistics.py` is in your working directory.

```bash
wget https://raw.githubusercontent.com/aimhubio/aim/main/troubleshooting/base_project_statistics.py
```

2. **Run the command**:  
   Execute the script with the required `--repo` parameter. For example:

```bash
python -m base_project_statistics --repo <path_to_repo>
```

3. **Review the output**:  
   The command generates a JSON file in the current working directory, containing statistics about the repository.

## Example JSON Output

A typical output file contains the following information:

```json
{
  "# of all runs": 7,
  "# of unindexed runs": 0,
  "total # of metrics": 188,
  "average # of metrics per run": 26.8,
  "max # of metrics for a single run": 47,
  "average # of params per run": 16,
  "max # of params for a single run": 16,
  "time to query runs (sec.)": 0.0353,
  "time to query metrics (sec.)": 15.7062
}
```

### Key Fields

- `# of all runs`: Total number of runs in the repository.
- `# of unindexed runs`: Number of runs that are not indexed.
- `total # of metrics`: Total count of metrics across all runs.
- `average # of metrics per run`: Average number of metrics per run.
- `max # of metrics for a single run`: Maximum number of metrics in a single run.
- `average # of params per run`: Average number of parameters per run.
- `max # of params for a single run`: Maximum number of parameters in a single run.
- `time to query runs (sec.)`: Time taken to query runs, in seconds.
- `time to query metrics (sec.)`: Time taken to query metrics, in seconds.
