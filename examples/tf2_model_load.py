import aim
from aim import Checkpoint
from aim.artifacts.utils import TfUtils

import tensorflow as tf

MODEL_PATH = '/Users/bkalisetti658/desktop/aim/.aim/default/index/objects/models/mnist-3.aim'
model = Checkpoint.load(MODEL_PATH)
model = model[1]

for layer in model.layers:
    print(layer.get_config(), layer.get_weights())