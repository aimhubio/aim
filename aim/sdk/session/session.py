import os
import atexit
import signal
import threading
from typing import Optional

from aim.sdk.session.utils import exception_resistant
from aim.sdk.session.configs import DEFAULT_FLUSH_FREQUENCY
from aim.engine.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.resource.tracker import ResourceTracker

from aim.storage.sdk.repo import Repo
from aim.storage.sdk.run import Run


class Session:
    sessions = {}

    _are_exit_listeners_set = False
    _original_sigint_handler = None
    _original_sigterm_handler = None

    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 flush_frequency: int = DEFAULT_FLUSH_FREQUENCY,  # unused
                 block_termination: bool = True,  # unused
                 run: Optional[str] = None,
                 system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT):

        self._repo = Repo.from_path(repo) if repo else Repo.default_repo()
        self._repo_path = self._repo.path
        self._run = self._repo.get_run(run) or Run(repo=self._repo)
        self._run_hash = self._run.hashname
        self.active = True
        if experiment:
            with self._repo.structured_db:
                self._run.props.experiment = experiment

        Session.sessions.setdefault(self._repo_path, [])
        Session.sessions[self._repo_path].append(self)

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
        val = args[0]
        name = kwargs.pop('name')
        step = kwargs.pop('step', None)
        epoch = kwargs.pop('epoch', None)
        for key in kwargs.keys():
            if key.startswith('__'):
                del kwargs[key]

        self._run.track(val, name=name, step=step, epoch=epoch, context=kwargs)

    @exception_resistant
    def set_params(self, params: dict, name: Optional[str] = None):
        if name is None:
            self._run[...] = params
        else:
            self._run[name] = params

    def flush(self):
        pass

    @exception_resistant
    def close(self):
        if not self.active:
            raise Exception('session is closed')
        if self._resource_usage_tracker is not None:
            self._resource_usage_tracker.stop()
        if self._repo_path in Session.sessions \
                and self in Session.sessions[self._repo_path]:
            Session.sessions[self._repo_path].remove(self)
            if len(Session.sessions[self._repo_path]) == 0:
                del Session.sessions[self._repo_path]
        self.active = False

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


DefaultSession = Session
