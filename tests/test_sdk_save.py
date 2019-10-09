import unittest

from keras.applications import vgg19


class TestSDKSave(unittest.TestCase):
    def test_sdk_save(self):
        vgg_model = vgg19.VGG19(include_top=True,
                                weights='imagenet',
                                input_tensor=None,
                                input_shape=None,
                                pooling=None,
                                classes=1000)

        # TODO: test sdk save
        # vgg_model.save('path_to_my_model.h5')
