import aim
from aim import Checkpoint
from aim.artifacts.utils import TfUtils

import tensorflow as tf

MODEL_PATH = '' #Path to .aim zip file
sess = Checkpoint.load(MODEL_PATH)
sess = sess[1]
print(TfUtils.get_weights(TfUtils.get_tf_t_vars(sess), sess))