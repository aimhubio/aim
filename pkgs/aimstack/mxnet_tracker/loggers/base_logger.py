import time
from typing import Any, List, Optional, Union

import numpy as np
from aimstack.experiment_tracker import TrainingRun
from mxnet.gluon.contrib.estimator import (BatchBegin, BatchEnd, EpochBegin,
                                           EpochEnd, Estimator, TrainBegin,
                                           TrainEnd)
from mxnet.gluon.contrib.estimator.utils import _check_metrics


class LoggingHandler(
    TrainBegin, TrainEnd, EpochBegin, EpochEnd, BatchBegin, BatchEnd
):
    """
    LoggingHandler logging handler class.

    Args:
        repo (:obj:`str`, optional): Aim repository path or Repo object to which TrainingRun object is bound.
            If skipped, default Repo is used.
        experiment_name (:obj:`str`, optional): Sets TrainingRun's `experiment` property. 'default' if not specified.
            Can be used later to query runs/sequences.
        log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed packages,
            git info, environment variables, etc.
        log_interval: (:obj:`int` or `str`) default: 'epoch': Logging interval during training.
            log_interval='epoch': display metrics every epoch
            log_interval=integer k: display metrics every interval of k batches
        metrics: (:obj:`list`, optional): Metrics to be logged, logged at batch end, epoch end, train end.
        priority: (:obj:`float`, optional), default np.Inf:  Priority level of the LoggingHandler.
            Priority level is sorted in ascending order.
            The lower the number is, the higher priority level the handler is.
    """

    def __init__(
        self,
        repo: Optional[str] = None,
        experiment_name: Optional[str] = None,
        log_system_params: Optional[bool] = True,
        log_interval: Union[int, str] = 'epoch',
        metrics: Optional[List[Any]] = None,
        priority=np.Inf,
    ):
        super().__init__()
        if not isinstance(log_interval, int) and log_interval != 'epoch':
            raise ValueError('log_interval must be either an integer or string "epoch"')

        self.metrics = _check_metrics(metrics)
        self.batch_index = 0
        self.current_epoch = 0
        self.processed_samples = 0
        # logging handler need to be called at last to make sure all states are updated
        # it will also shut down logging at train end
        self.priority = priority
        self.log_interval = log_interval
        self.log_interval_time = 0

        self.repo = repo
        self.experiment_name = experiment_name
        self.log_system_params = log_system_params
        self._run = None
        self._run_hash = None

    def train_begin(self, estimator: Optional[Estimator], *args, **kwargs):
        self.train_start = time.time()
        trainer = estimator.trainer
        optimizer = trainer.optimizer.__class__.__name__
        lr = trainer.learning_rate

        estimator.logger.info(
            'Training begin: using optimizer %s ' 'with current learning rate %.4f ',
            optimizer,
            lr,
        )
        if estimator.max_epoch:
            estimator.logger.info('Train for %d epochs.', estimator.max_epoch)
        else:
            estimator.logger.info('Train for %d batches.', estimator.max_batch)
        # reset all counters
        self.current_epoch = 0
        self.batch_index = 0
        self.processed_samples = 0
        self.log_interval_time = 0

        params = {
            'arch': estimator.net.name,
            'loss': estimator.loss.name,
            'optimizer': optimizer,
            'lr': lr,
            'max_epoch': estimator.max_epoch,
            'max_batch': estimator.max_batch,
        }

        self.setup(estimator, params)

    def train_end(self, estimator: Optional[Estimator], *args, **kwargs):
        train_time = time.time() - self.train_start
        msg = 'Train finished using total %ds with %d epochs. ' % (
            train_time,
            self.current_epoch,
        )
        # log every result in train stats including train/validation loss & metrics
        for metric in self.metrics:
            name, value = metric.get()
            msg += '%s: %.4f, ' % (name, value)
        estimator.logger.info(msg.rstrip(', '))

    def epoch_begin(self, estimator: Optional[Estimator], *args, **kwargs):
        if isinstance(self.log_interval, int) or self.log_interval == 'epoch':
            is_training = False
            for metric in self.metrics:
                if 'training' in metric.name:
                    is_training = True
            self.epoch_start = time.time()
            if is_training:
                estimator.logger.info(
                    '[Epoch %d] Begin, current learning rate: %.4f',
                    self.current_epoch,
                    estimator.trainer.learning_rate,
                )
            else:
                estimator.logger.info('Validation Begin')

    def epoch_end(self, estimator: Optional[Estimator], *args, **kwargs):
        if isinstance(self.log_interval, int) or self.log_interval == 'epoch':
            epoch_time = time.time() - self.epoch_start
            msg = '[Epoch %d] Finished in %.3fs, ' % (self.current_epoch, epoch_time)
            for metric in self.metrics:
                name, value = metric.get()
                msg += '%s: %.4f, ' % (name, value)

                context_name, metric_name = name.split(' ')
                context = {'subset': context_name}
                self._run.track(
                    value, metric_name, step=self.batch_index, context=context
                )
            estimator.logger.info(msg.rstrip(', '))
        self.current_epoch += 1
        self.batch_index = 0

    def batch_begin(self, estimator: Optional[Estimator], *args, **kwargs):
        if isinstance(self.log_interval, int):
            self.batch_start = time.time()

    def batch_end(self, estimator: Optional[Estimator], *args, **kwargs):
        if isinstance(self.log_interval, int):
            batch_time = time.time() - self.batch_start
            msg = '[Epoch %d][Batch %d]' % (self.current_epoch, self.batch_index)
            self.processed_samples += kwargs['batch'][0].shape[0]
            msg += '[Samples %s] ' % (self.processed_samples)
            self.log_interval_time += batch_time
            if self.batch_index % self.log_interval == 0:
                msg += 'time/interval: %.3fs ' % self.log_interval_time
                self.log_interval_time = 0
                for metric in self.metrics:
                    # only log current training loss & metric after each interval
                    name, value = metric.get()
                    msg += '%s: %.4f, ' % (name, value)

                    context_name, metric_name = name.split(' ')
                    context = {'subset': context_name}
                    self._run.track(
                        value, metric_name, step=self.batch_index, context=context
                    )
                estimator.logger.info(msg.rstrip(', '))
        self.batch_index += 1

    @property
    def experiment(self) -> TrainingRun:
        if not self._run:
            self.setup()
        return self._run

    def setup(self, estimator: Optional[Estimator] = None, args=None):
        if not self._run:
            if self._run_hash:
                self._run = TrainingRun(self._run_hash, repo=self.repo)
            else:
                self._run = TrainingRun(repo=self.repo)
                self._run_hash = self._run.hash
                self._run['is_mxnet_run'] = True
                if self.experiment_name is not None:
                    self._run.experiment = self.experiment_name
            if self.log_system_params:
                self._run.enable_system_monitoring()

        # Log config parameters
        if args:
            try:
                for key in args:
                    self._run.set(key, args[key], strict=False)
            except Exception as e:
                estimator.logger.warning(f'Aim could not log config parameters -> {e}')

    def __del__(self):
        if self._run is not None:
            self._run.close()
            del self._run
            self._run = None
