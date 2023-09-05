from sys import stdout
from typing import Optional

from aimstack.ml import Run


class AimLogger:
    """
    AimLogger logger class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which Run object is bound.
            If skipped, default Repo is used.
        experiment (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        loss_function (:obj:`str`, optional): Loss function
        log_cout (:obj:`bool`, optional): Enable/Disable stdout logging.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment: Optional[str] = None,
        log_system_params: Optional[bool] = True,
        loss_function: Optional[str] = 'Loss',
        log_cout=stdout,
    ):
        super().__init__()
        self._repo_path = repo
        self._experiment = experiment
        self._log_system_params = log_system_params
        self._run = None
        self._run_hash = None
        self._loss_function = loss_function
        self._log_cout = log_cout

        if log_cout is not None:
            assert hasattr(log_cout, 'write')

    @property
    def experiment(self) -> Run:
        if not self._run:
            self.setup()
        return self._run

    def setup(self):
        if self._run:
            return
        if self._run_hash:
            self._run = Run(self._run_hash, repo=self._repo_path)
        else:
            self._run = Run(repo=self._repo_path)
            self._run_hash = self._run.hash
            if self._experiment is not None:
                self._run.experiment = self._experiment

        if self._log_system_params:
            self._run.enable_system_monitoring()

    def _to_number(self, val):
        try:
            return float(val)
        except ValueError:
            return val

    def write(self, log):
        run = self.experiment

        _log = log
        log = log.strip().split()
        if log:
            if len(log) == 3 and log[1] == '=':
                run[log[0]] = self._to_number(log[2])
                return

            value_learn = None
            value_iter = None
            value_test = None
            value_best = None

            if log[1] == 'learn:':
                value_iter = int(log[0][:-1])
                value_learn = self._to_number(log[2])
                if log[3] == 'test:':
                    value_test = self._to_number(log[4])
                    if log[5] == 'best:':
                        value_best = self._to_number(log[6])
            if any((value_learn, value_test, value_best)):
                if value_learn:
                    run.track_auto(
                        value_learn,
                        name=self._loss_function,
                        step=value_iter,
                        context={'log': 'learn'},
                    )
                if value_test:
                    run.track_auto(
                        value_test,
                        name=self._loss_function,
                        step=value_iter,
                        context={'log': 'test'},
                    )
                if value_best:
                    run.track_auto(
                        value_best,
                        name=self._loss_function,
                        step=value_iter,
                        context={'log': 'best'},
                    )
            else:
                # Unhandled or junky log
                pass

        if self._log_cout:
            self._log_cout.write(_log)
