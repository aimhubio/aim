import tensorflow as tf
import os

import aim
from aim import Checkpoint

MODEL_PATH = '/Users/bkalisetti658/desktop/aim/.aim/default/index/objects/models/iris.aim'
imported = Checkpoint.load(MODEL_PATH)
imported = imported[1]