import os
from typing import Optional, Dict
import json

from aim.engine.configs import (
    AIM_OBJECTS_DIR_NAME,
    AIM_MAP_DIR_NAME,
    AIM_COMMIT_CONFIG_FILE_NAME,
)
from aim.engine.repo.utils import (
    get_run_objects_dir_path,
    get_run_objects_meta_file_path,
)
from aim.engine.repo.metric import Metric


class Run(object):
    def __init__(self, repo, experiment_name: str, run_hash: str):
        self.repo = repo
        self.experiment_name = experiment_name
        self.run_hash = run_hash
        self._config = None
        self._params = None
        self._metrics: Optional[Dict[str, Metric]] = {}
        self._tmp_all_metrics: Optional[Dict[str, Metric]] = None
        self._storage = None

    def __repr__(self):
        return '<{e}/{h}: {m}>'.format(e=self.experiment_name, h=self.run_hash,
                                       m=list(self._metrics.values()))

    def __hash__(self):
        return hash((self.repo.path, self.experiment_name, self.run_hash))

    @property
    def params(self) -> dict:
        if self._params is None:
            self._params = self._load_params()
        return self._params

    @property
    def config(self) -> dict:
        if self._config is None:
            self._config = self._load_config()
        return self._config

    @property
    def metrics(self) -> Dict[str, Metric]:
        return self._metrics

    @property
    def storage(self):
        return self._storage

    def open_storage(self):
        if self._storage is None:
            storage_path = get_run_objects_dir_path(self.repo.path,
                                                    self.experiment_name,
                                                    self.run_hash)
            self._storage = self.repo.get_records_storage(storage_path, 'r')

    def close_storage(self):
        if self._storage is not None:
            self._storage.close()

    def add(self, metric: Metric):
        if metric not in self._metrics:
            self._metrics.update({
                metric.name: metric,
            })

    def get_all_metrics(self) -> Dict[str, Metric]:
        if self._tmp_all_metrics is not None:
            return self._tmp_all_metrics

        meta_file_path = get_run_objects_meta_file_path(self.repo.path,
                                                        self.experiment_name,
                                                        self.run_hash)
        metrics = {}
        try:
            with open(meta_file_path, 'r+') as meta_file:
                artifacts = json.loads(meta_file.read().strip())
                # Filter only metrics
                for artifact in artifacts.values():
                    if artifact['type'] == 'metrics':
                        metric = Metric(self.repo,
                                        self,
                                        artifact['name'],
                                        artifact.get('context'))
                        metrics[artifact['name']] = metric
        except:
            pass

        self._tmp_all_metrics = metrics

        return metrics

    def to_dict(self) -> dict:
        metrics_list = []
        for metric_name, metric in self._metrics.items():
            metrics_list.append(metric.to_dict())
        return {
            'metrics': metrics_list,
            'experiment_name': self.experiment_name,
            'run_hash': self.run_hash,
            'date': self.config.get('date'),
            'params': self.params,
        }

    def _load_params(self) -> dict:
        params_file_path = os.path.join(self.repo.path,
                                        self.experiment_name,
                                        self.run_hash,
                                        AIM_OBJECTS_DIR_NAME,
                                        AIM_MAP_DIR_NAME,
                                        'dictionary.log')
        try:
            with open(params_file_path, 'r+') as params_file:
                params = json.loads(params_file.read().strip())
        except:
            params = {}
        return params

    def _load_config(self) -> dict:
        config_file_path = os.path.join(self.repo.path,
                                        self.experiment_name,
                                        self.run_hash,
                                        AIM_COMMIT_CONFIG_FILE_NAME)
        try:
            with open(config_file_path, 'r+') as config_file_path:
                config = json.loads(config_file_path.read().strip())
        except:
            config = {}
        return config
