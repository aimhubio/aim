import aim
from aim import Checkpoint

import tensorflow as tf

MODEL_PATH = '' # Path to .aim zip file
model = Checkpoint.load(MODEL_PATH)
model = model[1]

for layer in model.layers:
    print(layer.get_config(), layer.get_weights())