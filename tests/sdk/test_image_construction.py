from tests.base import TestBase

from aim.sdk import Image
import numpy as np


class TestImageConstruction(TestBase):
        # greyscale, dims = (1,2,2)
    img1 = np.array([[[0, 1], [1, 0]]], np.uint8)
    # greyscale, dims = (2,2)
    img2 = np.array([[0, 1], [1, 0]], np.uint8)
    # RGB, dims = (3,2,2)
    img3 = np.array([[[0, 1], [1, 0]], [[0, 1], [1, 0]], [[0, 1], [1, 0]]], np.uint8)

    def test_image_from_torch_tensor(self):
        try:
            import torch
        except (ImportError, AssertionError):
            raise ValueError('Cannot convert from torch.Tensor')

        # order of channels in torch.tensor => channels, height, width

        self.assertEqual(Image(torch.tensor(self.img1)), Image(np.transpose(self.img1, (1, 2, 0))))
        self.assertEqual(Image(torch.tensor(self.img2)), Image(self.img2))
        self.assertEqual(Image(torch.tensor(self.img3)), Image(np.transpose(self.img3, (1, 2, 0))))

        self.assertEqual(Image(torch.tensor(self.img1.astype(np.float32))), Image(255 * np.transpose(self.img1, (1, 2, 0))))
        self.assertEqual(Image(torch.tensor(self.img2.astype(np.float32))), Image(255 * self.img2))
        self.assertEqual(Image(torch.tensor(self.img3.astype(np.float32))), Image(255 * np.transpose(self.img3, (1, 2, 0))))

    def test_image_from_tf_tensor(self):
        try:
            import tensorflow as tf
        except (ImportError, AssertionError):
            raise ValueError('Cannot convert from tf.Tensor')

        # order of channels in tf.tensor => height, width, channels

        self.assertEqual(Image(tf.convert_to_tensor(self.img1, tf.uint8)), Image(self.img1))
        self.assertEqual(Image(tf.convert_to_tensor(self.img2, tf.uint8)), Image(self.img2))
        self.assertEqual(Image(tf.convert_to_tensor(self.img3, tf.uint8)), Image(self.img3))

        self.assertEqual(Image(tf.convert_to_tensor(self.img1, tf.float32)), Image(255 * self.img1))
        self.assertEqual(Image(tf.convert_to_tensor(self.img2, tf.float32)), Image(255 * self.img2))
        self.assertEqual(Image(tf.convert_to_tensor(self.img3, tf.float32)), Image(255 * self.img3))


if __name__ == "__main__":
    TestImageConstruction().test_image_from_torch_tensor()
    TestImageConstruction().test_image_from_tf_tensor()

