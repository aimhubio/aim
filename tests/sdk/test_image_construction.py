import time

from tests.base import TestBase
from tests.utils import remove_test_data

from aim.sdk import Image
import numpy as np
import torch

class TestImageConstruction(TestBase):
    def test_image_from_torch_tensor(self):
        try:
            import torch
        except (ImportError, AssertionError):
            raise ValueError('Cannot convert from torch.Tensor')

        # order of channels in torch.tensor => channels, height, width
        
        # greyscale, dims = (1,2,2)
        img1 = np.array([[[0,1],[1,0]]], np.uint8)   
        # greyscale, dims = (2,2)              
        img2 = np.array([[0,1],[1,0]], np.uint8)
        # RGB, dims = (3,2,2)                         
        img3 = np.array([[[0,1],[1,0]],[[0,1],[1,0]],[[0,1],[1,0]]], np.uint8) 

        self.assertEqual(Image(torch.tensor(img1)), Image(img1[0]))
        self.assertEqual(Image(torch.tensor(img2)), Image(img2))
        self.assertEqual(Image(torch.tensor(img3)), Image(np.transpose(img3,(1,2,0))))

        self.assertEqual(Image(torch.tensor(img1.astype(np.float32))), Image(255 * img1[0]))
        self.assertEqual(Image(torch.tensor(img2.astype(np.float32))), Image(255 * img2))
        self.assertEqual(Image(torch.tensor(img3.astype(np.float32))), Image(255 * np.transpose(img3,(1,2,0))))

if __name__ == "__main__":
    TestImageConstruction().test_image_from_torch_tensor()