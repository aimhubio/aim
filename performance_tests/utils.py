import os
import time

from aim.sdk import Repo
from aim.web.api.runs.utils import get_run_props


def timing(f):
    def wrap(*args, **kw):
        ts = time.time()
        for _ in range(5):
            f(*args, **kw)
        te = time.time()
        return (te-ts)/5
    return wrap


@timing
def collect_runs_data(query):
    repo = Repo.default_repo()
    runs = repo.query_runs(query)
    runs_dict = {}
    for run_trace_collection in runs.iter_runs():
        run = run_trace_collection.run
        runs_dict[run.hash] = {
            'params': run[...],
            'traces': run.collect_metrics_info(),
            'props': get_run_props(run)
        }


@timing
def collect_metrics_data(query):
    repo = Repo.default_repo()
    runs_dict = {}
    runs = repo.query_metrics(query=query)
    for run_trace_collection in runs.iter_runs():
        run = None
        traces_list = []
        for trace in run_trace_collection.iter():
            if not run:
                run = run_trace_collection.run
            iters, values = trace.values.sparse_numpy()
            traces_list.append({
                'metric_name': trace.name,
                'context': trace.context.to_dict(),
                'values': values,
                'iters': iters,
                'epochs': trace.epochs.values_numpy(),
                'timestamps': trace.timestamps.values_numpy()
            })
        if run:
            runs_dict[run.hash] = {
                'traces': traces_list,
                'params': run[...],
                'props': get_run_props(run),
            }


@timing
def query_runs(query):
    repo = Repo.default_repo()
    runs = list(repo.query_runs(query=query).iter_runs())


@timing
def query_metrics(query):
    repo = Repo.default_repo()
    metrics = list(repo.query_metrics(query=query).iter())


def get_baseline_filename():
    import performance_tests
    performance_tests_path = os.path.dirname(performance_tests.__file__)
    baseline_filename = os.path.join(performance_tests_path, 'BASELINE')
    if os.environ.get('AIM_PERFORMANCE_TESTS_BASELINE'):
        # for local performance testing
        baseline_filename = os.environ['AIM_PERFORMANCE_TESTS_BASELINE']

    return baseline_filename


def get_baseline(test_name):
    filename = get_baseline_filename()
    if not os.path.exists(filename):
        return None

    with open(filename, 'r') as f:
        for line in f:
            if test_name in line:
                return float(line.split()[1])

    return None


def write_baseline(test_name, exec_time):
    filename = get_baseline_filename()

    with open(filename, 'a+') as f:
        f.write(f'{test_name} {exec_time}\n')
