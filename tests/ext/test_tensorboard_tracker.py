from queue import Queue
import numpy as np
from PIL import ImageChops as PILImageChops
import tensorflow as tf
from tensorboard.compat.proto.summary_pb2 import SummaryMetadata, Summary
from tensorboard.compat.proto.tensor_pb2 import TensorProto
from tensorboard.compat.proto.tensor_shape_pb2 import TensorShapeProto
from tensorboard.compat.proto.event_pb2 import Event
from torch.utils.tensorboard.summary import image, scalar

from aim import Image
from aim.ext.tensorboard_tracker.tracker import TensorboardFolderTracker

from tests.base import TestBase


def images_same_data(image1: Image, image2: Image) -> bool:
    """
    Compare two Aim images to see if they contain the same values
    """
    image_diff = PILImageChops.difference(
        image1.to_pil_image(), image2.to_pil_image()
    )
    return image_diff.getbbox() is None


class TestTensorboardTracker(TestBase):

    def test__process_tb_image_event(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        height, width, channels = 5, 4, 3
        # Note channels is last
        image_np = np.random.randint(0, 16, (height, width, channels)).astype(dtype=np.uint8)
        # Create image summary in standard format
        image_summary = image(tag='test_image', tensor=image_np, dataformats='HWC')
        event = Event(summary=image_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        tracked_image = queue.get().value
        original_image = Image(image_np)
        self.assertTrue(isinstance(tracked_image, Image))
        self.assertTrue(tracked_image.size == original_image.size)
        self.assertTrue(images_same_data(tracked_image, original_image))

    def test__process_tb_image_plugin_event(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        height, width, channels = 5, 4, 3
        # Note channels is last
        image_np = np.random.randint(0, 16, (height, width, channels)).astype(dtype=np.uint8)
        # Create image summary in format of plugin
        plugin_data = SummaryMetadata.PluginData(plugin_name='images')
        smd = SummaryMetadata(plugin_data=plugin_data, )
        tensor = TensorProto(dtype='DT_STRING',
                             string_val=[
                                 f"{height}".encode(encoding='utf_8'),
                                 f"{width}".encode(encoding='utf_8'),
                                 tf.image.encode_png(image_np).numpy(),
                             ],
                             tensor_shape=TensorShapeProto(dim=[TensorShapeProto.Dim(size=3)]))

        image_summary = Summary(
            value=[Summary.Value(tag='test_image', metadata=smd, tensor=tensor)]
        )
        event = Event(summary=image_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        tracked_image = queue.get().value
        original_image = Image(image_np)
        self.assertTrue(isinstance(tracked_image, Image))
        self.assertTrue(tracked_image.size == original_image.size)
        self.assertTrue(images_same_data(tracked_image, original_image))

    def test__process_tb_scalar_simple_value_event(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        scalar_np = np.array(0.32, dtype=np.float32)
        scalar_summary = scalar('test_scalar', scalar_np, new_style=False)
        event = Event(summary=scalar_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        tracked_scalar = queue.get().value
        self.assertTrue(isinstance(tracked_scalar, float))
        self.assertTrue(np.allclose(tracked_scalar, scalar_np))

    def test__process_tb_scalar_plugin_event(self):
        # Given
        queue = Queue()
        tracker = TensorboardFolderTracker(tensorboard_event_folder='dummy', queue=queue)
        scalar_np = np.array(0.32, dtype=np.float32)
        scalar_summary = scalar('test_scalar', scalar_np, new_style=True)
        event = Event(summary=scalar_summary)

        # When
        tracker._process_tb_event(event)

        # Then
        tracked_scalar = queue.get().value
        self.assertTrue(isinstance(tracked_scalar, np.ndarray))
        self.assertTrue(np.allclose(tracked_scalar, scalar_np))
