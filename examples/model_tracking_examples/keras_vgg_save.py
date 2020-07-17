import aim
from aim import track

from keras.applications import vgg19


vgg_model = vgg19.VGG19(include_top=True,
                        weights='imagenet',
                        input_tensor=None,
                        input_shape=None,
                        pooling=None,
                        classes=1000)

track(aim.checkpoint, 'vgg19', 'vgg19_1', vgg_model, 0, meta={
    'classes': 1000,
    'pooling': None,
})
