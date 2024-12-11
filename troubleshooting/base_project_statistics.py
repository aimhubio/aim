import argparse
import json
import sys
import time

import aim
import tqdm


def count_metrics(run):
    run_metric_count = 0
    for context in run.meta_run_tree.subtree('traces').keys():
        run_metric_count += len(run.meta_run_tree.subtree(('traces', context)).keys_eager())
    return run_metric_count


def count_params(run):
    return count_dict_keys(run.meta_run_tree['attrs'])


def count_dict_keys(params):
    """
    Count the number of leaf nodes in a nested dictionary.
    A leaf node is a value that is not a dictionary.
    """
    return sum(count_dict_keys(value) if isinstance(value, dict) else 1 for value in params.values())


parser = argparse.ArgumentParser(description='Process command line arguments.')
parser.add_argument('--repo', type=str, required=True)
args = parser.parse_args(sys.argv[1:])

repo = aim.Repo.from_path(args.repo)

print('This script will collect basic statistics for Aim repository.')

stats = {}

all_runs = set(repo.list_all_runs())
unindexed_runs = set(repo.list_active_runs())

stats['runs_count'] = len(all_runs)
stats['unindexed_runs_count'] = len(unindexed_runs)

print('Collecting Runs info')
metrics_count_list = []
params_count_list = []
for run in tqdm.tqdm(repo.iter_runs()):
    metrics_count_list.append(count_metrics(run))
    params_count_list.append(count_params(run))
print('Done')

stats['metrics_count'] = sum(metrics_count_list)
stats['avg_metrics_per_run'] = round(sum(metrics_count_list) / len(all_runs), 2)
stats['max_metrics_per_run'] = max(metrics_count_list)
stats['avg_params_per_run'] = round(sum(params_count_list) / len(all_runs), 2)
stats['max_params_per_run'] = max(params_count_list)


print('Collecting query performance info')

# Execute Run query with a single parameter access.
# This is required to make sure there is a point lookup for each of the runs in the repo.
run_query = 'run.hparams.lr < 0.001'

start = time.time()
for run in repo.query_runs(run_query, report_mode=0).iter_runs():
    pass
end = time.time()
stats['runs_query_time'] = round(end - start, 4)

# Execute Metric query with a single run parameter access and metric name check.
# This is required to make sure there is a point lookup for each of the metrics in the repo.
metric_query = 'run.hparams.lr < 0.001 and metric.name == "loss"'
start = time.time()
for metric in repo.query_metrics(metric_query, report_mode=0).iter():
    pass
end = time.time()
stats['metrics_query_time'] = round(end - start, 4)
print('Done')

with open('aim_repo_stats.json', 'w') as fp:
    json.dump(stats, fp)
print(f'Stats for Aim repo "{args.repo}" are available at `aim_repo_stats.json`.')
