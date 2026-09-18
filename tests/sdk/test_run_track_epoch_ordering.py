import pytest

from aim.sdk import Run
from tests.base import TestBase


class TestEpochOrdering(TestBase):
    def test_track_out_of_order_epochs(self):
        """Test that tracking with epoch-only (no explicit step) uses epoch as step value.

        This ensures data points are connected in epoch order even when tracked out of order,
        as described in issue #3278.
        """
        run = Run(repo=self.repo, system_tracking_interval=None, capture_terminal_logs=False)

        # Simulate out-of-order tracking with epoch only
        run.track(0.5, name='train_loss', epoch=1)
        run.track(0.6, name='eval_loss', epoch=1)
        run.track(0.4, name='train_loss', epoch=2)
        run.track(0.3, name='train_loss', epoch=3)
        run.track(0.2, name='train_loss', epoch=4)
        run.track(0.5, name='eval_loss', epoch=3)  # Out of order
        run.track(0.55, name='eval_loss', epoch=2)  # Out of order

        # Retrieve eval_loss metric
        eval_metric = run.get_metric('eval_loss', context={})
        assert eval_metric is not None

        # Get steps and values
        steps, (values, epochs, _) = eval_metric.data.items_list()

        # Steps should be sorted (they're used for connecting data points)
        assert steps == sorted(steps), f"Steps should be sorted, got {steps}"

        # Since epoch is used as step when step is not provided,
        # the sorted steps should correspond to sorted epochs
        assert steps == [1, 2, 3], f"Expected steps [1, 2, 3], got {steps}"
        assert epochs == [1, 2, 3], f"Expected epochs [1, 2, 3], got {epochs}"
        assert values == [0.6, 0.55, 0.5], f"Expected values [0.6, 0.55, 0.5], got {values}"

    def test_track_explicit_step_overrides_epoch(self):
        """Test that explicit step values override epoch-based step assignment."""
        run = Run(repo=self.repo, system_tracking_interval=None, capture_terminal_logs=False)

        # Track with explicit step and epoch
        run.track(0.5, name='metric', step=0, epoch=1)
        run.track(0.4, name='metric', step=10, epoch=2)
        run.track(0.3, name='metric', step=20, epoch=3)

        metric = run.get_metric('metric', context={})
        assert metric is not None

        steps, (values, epochs, _) = metric.data.items_list()

        # Steps should be the explicit values, not the epochs
        assert steps == [0, 10, 20], f"Expected steps [0, 10, 20], got {steps}"
        assert epochs == [1, 2, 3], f"Expected epochs [1, 2, 3], got {epochs}"

    def test_track_no_epoch_no_step_auto_increment(self):
        """Test that auto-increment still works when neither step nor epoch is provided."""
        run = Run(repo=self.repo, system_tracking_interval=None, capture_terminal_logs=False)

        # Track without step or epoch
        run.track(0.5, name='metric')
        run.track(0.4, name='metric')
        run.track(0.3, name='metric')

        metric = run.get_metric('metric', context={})
        assert metric is not None

        steps, (values, epochs, _) = metric.data.items_list()

        # Steps should auto-increment from 0
        assert steps == [0, 1, 2], f"Expected steps [0, 1, 2], got {steps}"

    def test_track_mixed_epoch_and_no_epoch(self):
        """Test mixed tracking: some with epoch, some without."""
        run = Run(repo=self.repo, system_tracking_interval=None, capture_terminal_logs=False)

        # Track with epoch
        run.track(0.5, name='metric', epoch=5)
        # Track without epoch (should auto-increment from max step + 1)
        run.track(0.4, name='metric')
        # Track with epoch again
        run.track(0.3, name='metric', epoch=10)

        metric = run.get_metric('metric', context={})
        assert metric is not None

        steps, (values, epochs, _) = metric.data.items_list()

        # First: epoch 5 -> step 5
        # Second: no epoch -> step 6 (5 + 1)
        # Third: epoch 10 -> step 10
        assert steps == [5, 6, 10], f"Expected steps [5, 6, 10], got {steps}"
