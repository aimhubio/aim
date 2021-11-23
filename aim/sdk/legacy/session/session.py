import os
import atexit
import signal
import threading
from typing import Optional

from aim.ext.exception_resistant import exception_resistant
from aim.sdk.legacy.deprecation_warning import deprecated
from aim.ext.resource.configs import DEFAULT_SYSTEM_TRACKING_INT
from aim.ext.resource.tracker import ResourceTracker

from aim.sdk.repo import Repo
from aim.sdk.run import Run


class Session:
    sessions = {}

    _are_exit_listeners_set = False
    _original_sigint_handler = None
    _original_sigterm_handler = None

    @deprecated
    def __init__(self, repo: Optional[str] = None,
                 experiment: Optional[str] = None,
                 flush_frequency: int = 0,  # unused
                 block_termination: bool = True,  # unused
                 run: Optional[str] = None,
                 system_tracking_interval: Optional[int] = DEFAULT_SYSTEM_TRACKING_INT):

        self._repo = Repo.from_path(repo) if repo else Repo.default_repo()
        self._repo_path = self._repo.path
        self._run = Run(run, repo=self._repo, experiment=experiment,
                        system_tracking_interval=system_tracking_interval)
        self._run_hash = self._run.hash
        self.active = True

        Session.sessions.setdefault(self._repo_path, [])
        Session.sessions[self._repo_path].append(self)

        # Bind signal listeners
        self._set_exit_handlers()

    @property
    def run_hash(self):
        return self._run_hash

    @property
    def repo_path(self):
        return self._repo_path

    @exception_resistant(silent=False)
    def track(self, *args, **kwargs):
        val = args[0]
        name = kwargs.pop('name')
        step = kwargs.pop('step', None)
        epoch = kwargs.pop('epoch', None)
        for key in kwargs.keys():
            if key.startswith('__'):
                del kwargs[key]

        self._run.track(val, name=name, step=step, epoch=epoch, context=kwargs)

    @exception_resistant(silent=False)
    def set_params(self, params: dict, name: Optional[str] = None):
        if name is None:
            self._run[...] = params
        else:
            self._run[name] = params

    def flush(self):
        pass

    @exception_resistant(silent=False)
    def close(self):
        if not self.active:
            raise Exception('session is closed')
        if self._run:
            del self._run
            self._run = None
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


def get_default_session() -> Session:
    if len(Session.sessions.keys()) > 0:
        default_sess_key = list(Session.sessions.keys())[0]
        if len(Session.sessions[default_sess_key]) > 0:
            return Session.sessions[default_sess_key][0]

    # Create and return default session otherwise
    return DefaultSession()
