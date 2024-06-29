class TrackerKerasCallbackMetricsEpochEndMixin(object):
    def on_epoch_end(self, epoch, logs=None):
        # Log metrics
        self._log_epoch_metrics(epoch, logs)

    def _get_learning_rate(self):
        lr_schedule = getattr(self.model.optimizer, 'lr', None)
        try:
            return lr_schedule(self.model.optimizer.iterations)
        except Exception:
            return None

    def _log_epoch_metrics(self, epoch, logs):
        if not logs:
            return

        track_func = self._run.track

        train_logs = {k: v for k, v in logs.items() if not k.startswith('val_')}
        for name, value in train_logs.items():
            track_func(value, name=name, epoch=epoch, context={'subset': 'train'})

        val_logs = {k: v for k, v in logs.items() if k.startswith('val_')}
        for name, value in val_logs.items():
            track_func(value, name=name[4:], epoch=epoch, context={'subset': 'val'})

        lr = self._get_learning_rate()
        if lr is not None:
            track_func(lr, name='lr', epoch=epoch, context={'subset': 'train'})
