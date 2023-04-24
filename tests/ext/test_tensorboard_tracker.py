from queue import Queue
import numpy as np
from tensorboard.compat.proto.summary_pb2 import SummaryMetadata, Summary
from tensorboard.compat.proto.event_pb2 import Event
from tensorboard.util.tensor_util import make_tensor_proto
from torch.utils.tensorboard.summary import histogram, histogram_raw

from aim import Distribution
from aim.ext.tensorboard_tracker.tracker import TensorboardFolderTracker

from tests.base import TestBase


class TestTensorboardTracker(TestBase):

    def test__process_tb_histogram_event(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        batch_dim, num_samples, num_bins = 3, 31, 11
        histogram_samples_values_np = np.random.randn(batch_dim, num_samples)
        histogram_counts_np, histogram_bin_edges_np = np.histogram(histogram_samples_values_np, bins=num_bins)
        histogram_summary = histogram('test_histogram', values=histogram_samples_values_np, bins=num_bins)
        event = Event(summary=histogram_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        tracked_histogram = queue.get().value
        self.assertTrue(isinstance(tracked_histogram, Distribution))
        tracked_counts_np, tracked_bin_edges_np = tracked_histogram.to_np_histogram()
        self.assertTrue(np.allclose(tracked_counts_np, histogram_counts_np))
        self.assertTrue(np.allclose(tracked_bin_edges_np, histogram_bin_edges_np))

    def test__process_tb_histogram_event_empty_all_zeros(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        num_bins = 11

        histogram_summary = histogram_raw(
            name='test_histogram',
            min=0.0,
            max=0.0,
            num=num_bins,
            sum=0.0,
            sum_squares=0.0,
            bucket_limits=[0.0]*num_bins,
            bucket_counts=[0.0]*num_bins,
        )
        event = Event(summary=histogram_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        self.assertTrue(queue.empty())

    def test__process_tb_histogram_event_empty_no_values(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)

        histogram_summary = histogram_raw(
            name='test_histogram',
            min=0.0,
            max=0.0,
            num=0,
            sum=0.0,
            sum_squares=0.0,
            bucket_limits=[],
            bucket_counts=[],
        )
        event = Event(summary=histogram_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        self.assertTrue(queue.empty())

    def test__process_tb_histogram_plugin_event(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        batch_dim, num_samples, num_bins = 3, 31, 11
        histogram_samples_values_np = np.random.randn(batch_dim, num_samples)
        histogram_counts_np, histogram_bin_edges_np = np.histogram(histogram_samples_values_np, bins=num_bins)

        # Create histogram summary in format of plugin
        plugin_data = SummaryMetadata.PluginData(plugin_name='histograms')
        smd = SummaryMetadata(plugin_data=plugin_data)
        left_edge_np = histogram_bin_edges_np[:-1]
        right_edge_np = histogram_bin_edges_np[1:]
        tensor_content = np.hstack([
            left_edge_np[:, None], right_edge_np[:, None], histogram_counts_np[:, None]
        ])
        # float64 for DT_DOUBLE
        tensor = make_tensor_proto(tensor_content.astype(dtype=np.float64))
        histogram_summary = Summary(
            value=[Summary.Value(tag='test_histogram', metadata=smd, tensor=tensor)]
        )
        event = Event(summary=histogram_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        tracked_histogram = queue.get().value
        self.assertTrue(isinstance(tracked_histogram, Distribution))
        tracked_counts_np, tracked_bin_edges_np = tracked_histogram.to_np_histogram()
        self.assertTrue(np.allclose(tracked_counts_np, histogram_counts_np))
        self.assertTrue(np.allclose(tracked_bin_edges_np, histogram_bin_edges_np))

    def test__process_tb_histogram_plugin_event_empty_no_values(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        num_bins = 11
        histogram_counts_np = np.zeros(num_bins)
        left_edge_np = np.zeros(num_bins)
        right_edge_np = np.zeros(num_bins)

        # Create histogram summary in format of plugin
        plugin_data = SummaryMetadata.PluginData(plugin_name='histograms')
        smd = SummaryMetadata(plugin_data=plugin_data)
        tensor_content = np.hstack([
            left_edge_np[:, None], right_edge_np[:, None], histogram_counts_np[:, None]
        ])
        tensor = make_tensor_proto(tensor_content.astype(dtype=np.float64))
        histogram_summary = Summary(
            value=[Summary.Value(tag='test_histogram', metadata=smd, tensor=tensor)]
        )
        event = Event(summary=histogram_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        self.assertTrue(queue.empty())

    def test__process_tb_histogram_plugin_event_empty_all_zeros(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        num_bins = 11
        histogram_counts_np = np.zeros(num_bins)
        left_edge_np = np.zeros(num_bins)
        right_edge_np = np.zeros(num_bins)

        # Create histogram summary in format of plugin
        plugin_data = SummaryMetadata.PluginData(plugin_name='histograms')
        smd = SummaryMetadata(plugin_data=plugin_data)
        tensor_content = np.hstack([
            left_edge_np[:, None], right_edge_np[:, None], histogram_counts_np[:, None]
        ])
        tensor = make_tensor_proto(tensor_content.astype(dtype=np.float64))
        histogram_summary = Summary(
            value=[Summary.Value(tag='test_histogram', metadata=smd, tensor=tensor)]
        )
        event = Event(summary=histogram_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        self.assertTrue(queue.empty())
