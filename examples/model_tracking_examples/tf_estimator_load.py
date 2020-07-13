import tensorflow as tf
import os

import aim
from aim import Checkpoint

MODEL_PATH = '' # Path to .aim zip file
imported = Checkpoint.load(MODEL_PATH)
imported = imported[1]

def predict(x):
  example = tf.train.Example()
  example.features.feature["x"].float_list.value.extend([x])
  return imported.signatures["predict"](
    examples=tf.constant([example.SerializeToString()]))

print(predict(1.5))
print(predict(3.5))