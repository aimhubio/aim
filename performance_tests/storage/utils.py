import os

from aim.sdk.configs import get_aim_repo_name
from aim.storage.rockscontainer import RocksContainer
from performance_tests.utils import timing


@timing(10)
def open_containers_for_read(container_paths_list):
    for path in container_paths_list:
        container = RocksContainer(path, read_only=True)
        container.db


@timing
def random_access_metric_values(metric, density):
    values = metric.values
    values_length = len(values)
    step = len(values)//density

    accessed_values = []
    for i in range(0, values_length, step):
        accessed_values.append(metric.values[i])


@timing
def iterative_access_metric_values(repo):
    query = 'metric.name == "metric 0"'
    traces = repo.query_metrics(query=query)
    for trace in traces.iter():
        _ = trace.values.values_numpy()


def collect_sequence_containers():
    sequences_subdir = f'{get_aim_repo_name()}/seqs'
    return os.listdir(sequences_subdir)
