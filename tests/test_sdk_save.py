import unittest

from keras.applications import vgg19

from aim.sdk.save import Checkpoint
from aim.sdk.save.save import save


class TestSDKSave(unittest.TestCase):
    def test_sdk_save(self):
        vgg_model = vgg19.VGG19(include_top=True,
                                weights='imagenet',
                                input_tensor=None,
                                input_shape=None,
                                pooling=None,
                                classes=1000)

        for e in range(3):
            save(Checkpoint('vgg_model',
                            'vgg_checkpoint_{}'.format(e),
                            vgg_model, epoch=e, meta={'foo': 'bar'}))
