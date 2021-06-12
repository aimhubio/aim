import os
import atexit
import signal
import threading
from collections import namedtuple
from typing import Optional, Dict, List, Tuple
from queue import Queue, Empty

from aim.engine.repo import AimRepo
from aim.artifacts.artifact_writer import ArtifactWriter
from aim.sdk.session.utils import (
    exception_resistant,
)
from aim.sdk.session.configs import DEFAULT_FLUSH_FREQUENCY
from aim.artifacts import *
from aim.engine.utils import (
    contexts_equal,
    convert_to_py_number,
    is_number,
)
from aim.engine.configs import (
    AIM_BRANCH_ENV_VAR,
    AIM_COMMIT_ENV_VAR,
    AIM_AUTOMATED_EXEC_ENV_VAR,
    AIM_DEFAULT_BRANCH_NAME,
    AIM_MAP_METRICS_KEYWORD,
    DEFAULT_SYSTEM_TRACKING_INT,
)
from aim.resource.tracker import ResourceTracker


class Session:
    sessions = {}  # type: Dict[str, List['Session']] = {}

    Job = namedtuple('Job', 'target, args, kwargs')

    _are_exit_listeners_set = False
    _original_sigint_handler = None
    _original_sigterm_handler = None

    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 flush_frequency: int = DEFAULT_FLUSH_FREQUENCY,
                 block_termination: bool = True,
                 run: Optional[str] = None,
                 system_tracking_interval: Optional[int]
                 = DEFAULT_SYSTEM_TRACKING_INT):
        self.active = False
        self._lock = threading.Lock()
        self._close_lock = threading.Lock()

        self.repo = self.get_repo(repo, experiment, run)

        Session.sessions.setdefault(self.repo.path, [])
        Session.sessions[self.repo.path].append(self)

        # Start a new run
        self.repo.commit_init()

        self.flush_frequency = flush_frequency
        self.metrics = {}  # type: Dict[str, List[Dict]]
        self._metrics_flush = {}  # type: Dict[str, List[int, int]]

        self.active = True
        self._run_hash = self.repo.active_commit
        self._repo_path = self.repo.path

        # Run queue worker
        self._queue = Queue()
        self._queue_worker_th = threading.Thread(target=self._queue_worker)
        self._queue_worker_th.daemon = True
        self._queue_worker_th.start()
        self._block_termination = block_termination

        # Bind signal listeners
        self._set_exit_handlers()

        # Collect resource usage stats
        self._resource_usage_tracker = None
        if system_tracking_interval \
                and isinstance(system_tracking_interval, int) \
                and system_tracking_interval > 0:
            try:
                self._resource_usage_tracker = ResourceTracker(
                    self.track, system_tracking_interval
                )
            except ValueError:
                print('To track system resource usage '
                      'please set `system_tracking_interval` greater than 0 '
                      'and less than 1 day')
            else:
                self._resource_usage_tracker.start()

    @property
    def run_hash(self):
        return self._run_hash

    @property
    def repo_path(self):
        return self._repo_path

    @exception_resistant
    def track(self, *args, **kwargs):
        if not self.active:
            raise Exception('session is closed')
        job = Session.Job(target=self._track, args=args, kwargs=kwargs)
        self._queue.put(job)

    def set_params(self, params: dict, name: Optional[str] = None):
        return self.track(params, namespace=(name or AIM_NESTED_MAP_DEFAULT))

    @exception_resistant
    def flush(self):
        if not self.active:
            raise Exception('session is closed')
        job = Session.Job(target=self._flush, args=[], kwargs={})
        self._queue.put(job)

    @exception_resistant
    def close(self):
        if not self.active:
            raise Exception('session is closed')
        self._close()

    @exception_resistant
    def _track(self, *args, **kwargs):
        should_lock = kwargs.get('__aim_acquire_lock') is not False
        should_check_sess_status = \
            kwargs.get('__aim_check_session_status') is not False

        if should_lock:
            with self._lock:
                if should_check_sess_status \
                        and not self.active and not self._block_termination:
                    return
                return self._track_body(*args, **kwargs)
        else:
            if should_check_sess_status \
                    and not self.active and not self._block_termination:
                return
            return self._track_body(*args, **kwargs)

    @exception_resistant
    def _track_body(self, *args, **kwargs):
        if self.repo is None:
            raise FileNotFoundError('Aim repository was not found')

        artifact_name = None

        if not len(args):
            raise TypeError('artifact name is not specified')

        number_ = convert_to_py_number(args[0])

        if isinstance(args[0], str):
            artifact_name = args[0]
        elif is_number(args[0]):
            # Autodetect Metric artifact
            artifact_name = metric
            kwargs['value'] = convert_to_py_number(args[0])
            args = []
        elif isinstance(args[0], dict):
            # Autodetect Dictionary(Map) artifact
            artifact_name = dictionary
            kwargs['value'] = args[0]
            args = []

        if artifact_name is None:
            raise TypeError('artifact name is not specified')

        if artifact_name not in globals():
            raise TypeError('Aim cannot track:\'{}\''.format(artifact_name))

        # Get corresponding class
        obj = globals()[artifact_name]

        # Create an instance
        inst = obj(*args, **kwargs, __aim_session_id=self.run_hash)

        # Collect metrics values
        if isinstance(inst, Metric):
            self._aggregate_metrics(inst)
            self._flush_metrics(force=False, check_status=False)

        writer = ArtifactWriter()
        writer.save(self.repo, inst)

        return inst

    @exception_resistant
    def _flush(self):
        with self._lock:
            if not self.active and not self._block_termination:
                return
            self._flush_metrics(force=True, check_status=True)

    @exception_resistant
    def _close(self, remove_session=True):
        with self._close_lock:
            if self.active:
                # Wait until all jobs are done
                self._queue.join()

                # Stop resource usage tracker
                if self._resource_usage_tracker is not None:
                    self._resource_usage_tracker.stop()

                # Write aggregated metrics
                self._flush_metrics(force=True, check_status=False)

                # Set session status to non-active
                self.active = False

                self.repo.close_records_storage()
                self.repo.commit_finish()

                if remove_session:
                    if self.repo.path in Session.sessions \
                            and self in Session.sessions[self.repo.path]:
                        Session.sessions[self.repo.path].remove(self)
                        if len(Session.sessions[self.repo.path]) == 0:
                            del Session.sessions[self.repo.path]

    @exception_resistant
    def _queue_worker(self):
        while self.active or not self._queue.empty():
            try:
                job = self._queue.get(timeout=0.05)
            except Empty:
                pass
            else:
                job.target(*job.args, **job.kwargs)
                self._queue.task_done()

    @exception_resistant
    def _aggregate_metrics(self, metric_inst):
        value = metric_inst.value
        self.metrics.setdefault(metric_inst.name, [])
        self._metrics_flush.setdefault(metric_inst.name, [0, 0])
        self._metrics_flush[metric_inst.name][0] = metric_inst.step
        for metric_item in self.metrics[metric_inst.name]:
            if contexts_equal(metric_item['context'],
                              metric_inst.hashable_context):
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
    def _flush_metrics(self, force=False, check_status=False):
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
            self._track(self.metrics,
                        namespace=AIM_MAP_METRICS_KEYWORD,
                        __aim_acquire_lock=False,
                        __aim_check_session_status=check_status)

    @classmethod
    def _close_sessions(cls, *args, **kwargs):
        threads = []
        for _, sessions in cls.sessions.items():
            for session in sessions:
                th = threading.Thread(target=session.close)
                th.daemon = True
                threads.append(th)

        for th in threads:
            th.start()

        for th in threads:
            th.join()

        if len(args):
            if args[0] == 15:
                signal.signal(signal.SIGTERM, cls._original_sigterm_handler)
                os.kill(os.getpid(), 15)
            # elif args[0] == 2:
            #     signal.signal(signal.SIGINT, cls._original_sigint_handler)
            #     os.kill(os.getpid(), 2)

    @classmethod
    def _set_exit_handlers(cls):
        if not cls._are_exit_listeners_set:
            cls._are_exit_listeners_set = True
            # cls._original_sigint_handler = signal.getsignal(signal.SIGINT)
            cls._original_sigterm_handler = signal.getsignal(signal.SIGTERM)

            atexit.register(cls._close_sessions)
            # signal.signal(signal.SIGINT, cls._close_sessions)
            signal.signal(signal.SIGTERM, cls._close_sessions)

    @staticmethod
    def get_repo(path: Optional[str] = None,
                 experiment_name: Optional[str] = None,
                 run: Optional[str] = None) -> AimRepo:
        # Auto commit
        if os.getenv(AIM_AUTOMATED_EXEC_ENV_VAR):
            # Get Aim environment variables
            branch_name = os.getenv(AIM_BRANCH_ENV_VAR)
            commit_hash = os.getenv(AIM_COMMIT_ENV_VAR)
        else:
            if run is not None:
                commit_hash = run
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

        init_err_msg = 'can not create repo `{}`'.format(path)

        if path is not None:
            repo = AimRepo(path)
            if not repo.exists() or not repo.is_initialized():
                if not repo.init():
                    raise ValueError(init_err_msg)
            repo = AimRepo(path, branch_name, commit_hash)
        else:
            repo = AimRepo.get_working_repo()
            if repo is None:
                path = os.getcwd()
                repo = AimRepo(path)
                if not repo.init():
                    raise ValueError(init_err_msg)
                repo = AimRepo(path, branch_name, commit_hash)
            else:
                if not repo.is_initialized() and not repo.init():
                    raise ValueError(init_err_msg)
                repo = AimRepo.get_working_repo(branch_name, commit_hash)

        return repo


DefaultSession = Session
