import os
import atexit
from typing import Optional, Dict, List, Tuple

from aim.engine.repo import AimRepo
from aim.artifacts.artifact_writer import ArtifactWriter
from aim.sdk.session.utils import exception_resistant
from aim.artifacts import *
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
    AIM_DEFAULT_BRANCH_NAME,
    AIM_MAP_METRICS_KEYWORD,
)


class Session:
    sessions = {}  # type: Dict[str, List['Session']] = {}

    @exception_resistant
    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 flush_frequency=64):
        self.active = False

        self.repo = self.get_repo(repo, experiment)

        Session.sessions.setdefault(self.repo.path, [])
        Session.sessions[self.repo.path].append(self)

        # Start a new run
        self.repo.commit_init()

        self.metrics = {}  # type: Dict[str, List[Dict]]
        self.flush_frequency = flush_frequency
        self._metrics_flush = {}  # type: Dict[str, List[int, int]]

        self.active = True
        self._run_hash = self.repo.active_commit
        self._repo_path = self.repo.path

        # Finalize run
        atexit.register(self.close)

    @exception_resistant
    def __del__(self):
        self.close()

    @property
    def run_hash(self):
        return self._run_hash

    @property
    def repo_path(self):
        return self._repo_path

    @exception_resistant
    def close(self):
        if self.active:
            self.active = False

            # Write aggregated metrics
            self._flush_metrics(force=True)

            self.repo.close_records_storage()
            self.repo.commit_finish()

            if self.repo.path in Session.sessions \
                    and self in Session.sessions[self.repo.path]:
                Session.sessions[self.repo.path].remove(self)
                if len(Session.sessions[self.repo.path]) == 0:
                    del Session.sessions[self.repo.path]

    @exception_resistant
    def track(self, *args, **kwargs):
        if self.repo is None:
            raise FileNotFoundError('Aim repository was not found')

        artifact_name = None

        if not len(args):
            raise TypeError('artifact name is not specified')

        if isinstance(args[0], str):
            artifact_name = args[0]
        elif isinstance(args[0], int) or isinstance(args[0], float):
            # Autodetect Metric artifact
            artifact_name = metric
            kwargs['value'] = args[0]
            args = []
        elif isinstance(args[0], dict):
            # Autodetect Dictionary(Map) artifact
            artifact_name = dictionary
            kwargs['value'] = args[0]
            args = []

        if artifact_name is None:
            raise TypeError('artifact name is not specified')

        if artifact_name not in globals():
            raise TypeError('Aim cannot track: \'{}\''.format(artifact_name))

        # Get corresponding class
        obj = globals()[artifact_name]

        # Create an instance
        inst = obj(*args, **kwargs, aim_session_id=id(self))

        # Collect metrics values
        if isinstance(inst, Metric):
            self._aggregate_metrics(inst)
            self._flush_metrics(force=False)

        writer = ArtifactWriter()
        writer.save(self.repo, inst)

        return inst

    @exception_resistant
    def set_params(self, params: dict, name: Optional[str] = None):
        if name is None:
            name = AIM_NESTED_MAP_DEFAULT
        return self.track(params, namespace=name)

    @exception_resistant
    def flush(self):
        self._flush_metrics(force=True)

    @exception_resistant
    def _aggregate_metrics(self, metric_inst):
        value = metric_inst.value
        self.metrics.setdefault(metric_inst.name, [])
        self._metrics_flush.setdefault(metric_inst.name, [0, 0])
        self._metrics_flush[metric_inst.name][0] = metric_inst.step
        for metric_item in self.metrics[metric_inst.name]:
            if metric_item['context'] == metric_inst.hashable_context:
                if value < metric_item['values']['min']:
                    metric_item['values']['min'] = value
                if value > metric_item['values']['max']:
                    metric_item['values']['max'] = value
                metric_item['values']['last'] = value
                break
        else:
            self.metrics[metric_inst.name].append({
                'context': metric_inst.hashable_context,
                'values': {
                    'min': value,
                    'max': value,
                    'last': value,
                },
            })

    @exception_resistant
    def _flush_metrics(self, force=False):
        if force:
            should_flush = True
        elif self.flush_frequency == 0:
            should_flush = False
        else:
            should_flush = False
            for metric_name, metric_flush_info in self._metrics_flush.items():
                metric_step = metric_flush_info[0]
                metric_last_flush = metric_flush_info[1]
                if metric_last_flush + self.flush_frequency <= metric_step:
                    should_flush = True
                    break

        if should_flush:
            for _, metric_flush_info in self._metrics_flush.items():
                metric_flush_info[1] = metric_flush_info[0]
            self.set_params(self.metrics, name=AIM_MAP_METRICS_KEYWORD)

    @staticmethod
    @exception_resistant
    def get_repo(path: Optional[str] = None,
                 experiment_name: Optional[str] = None) -> AimRepo:
        # Auto commit
        if os.getenv(AIM_AUTOMATED_EXEC_ENV_VAR):
            # Get Aim environment variables
            branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
            commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)
        else:
            commit_hash = AimRepo.generate_commit_hash()
            if experiment_name is not None:
                branch_name = experiment_name
            else:
                # FIXME: Get active experiment name from given repo
                #  if path is specified. Currently active experiment name of
                #  the highest repo in the hierarchy will be returned.
                branch_name = AimRepo.get_active_branch_if_exists() \
                              or AIM_DEFAULT_BRANCH_NAME

        if path is not None:
            repo = AimRepo(path)
            if not repo.exists():
                if not repo.init():
                    raise ValueError('can not create repo `{}`'.format(path))
            repo = AimRepo(path, branch_name, commit_hash)
        else:
            if AimRepo.get_working_repo() is None:
                path = os.getcwd()
                repo = AimRepo(path)
                if not repo.init():
                    raise ValueError('can not create repo `{}`'.format(path))
                repo = AimRepo(path, branch_name, commit_hash)
            else:
                repo = AimRepo.get_working_repo(branch_name, commit_hash)

        return repo


DefaultSession = Session
