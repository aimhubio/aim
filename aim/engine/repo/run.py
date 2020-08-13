import os
from typing import Optional, Dict
import json

from aim.engine.configs import (
    AIM_OBJECTS_DIR_NAME,
    AIM_MAP_DIR_NAME,
    AIM_COMMIT_META_FILE_NAME,
)
from aim.engine.repo.metric import Metric


class Run(object):
    def __init__(self, repo, experiment_name: str, run_hash: str):
        self.repo = repo
        self.experiment_name = experiment_name
        self.run_hash = run_hash
        self._params = None
        self._metrics: Optional[Dict[str, Metric]] = {}
        self._tmp_all_metrics: Optional[Dict[str, Metric]] = None

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
    def metrics(self) -> Dict[str, Metric]:
        return self._metrics

    def add(self, metric: Metric):
        if metric not in self._metrics:
            self._metrics.update({
                metric.name: metric,
            })

    def get_all_metrics(self) -> Dict[str, Metric]:
        if self._tmp_all_metrics is not None:
            return self._tmp_all_metrics

        meta_file_path = os.path.join(self.repo.path,
                                      self.experiment_name,
                                      self.run_hash,
                                      AIM_OBJECTS_DIR_NAME,
                                      AIM_COMMIT_META_FILE_NAME)
        metrics = {}
        try:
            with open(meta_file_path, 'r+') as meta_file:
                artifacts = json.loads(meta_file.read().strip())
                # Filter only metrics
                for artifact in artifacts.values():
                    if artifact['type'] == 'metrics':
                        metric = Metric(self.repo,
                                        self.experiment_name,
                                        self.run_hash,
                                        artifact['name'],
                                        artifact.get('context'))
                        metrics[artifact['name']] = metric
        except:
            pass

        self._tmp_all_metrics = metrics

        return metrics

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
