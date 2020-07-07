import aim
from aim import Checkpoint
from aim.artifacts.utils import TfUtils

import tensorflow as tf


# Import MNIST data
from tensorflow.examples.tutorials.mnist import input_data
mnist = input_data.read_data_sets("/tmp/data/", one_hot=True)

learning_rate = 0.1
num_steps = 500
batch_size = 128
display_step = 100

# Network Parameters
n_hidden_1 = 256 # 1st layer number of neurons
n_hidden_2 = 256 # 2nd layer number of neurons
n_hidden_3 = 256 # 3rd layer number of neurons
num_input = 784 # MNIST data input (img shape: 28*28)
num_classes = 10 # MNIST total classes (0-9 digits)

# Create model
def neural_net_with_layers(x):
    # Input Layer
    input_layer = tf.layers.dense(inputs=x, units=num_input, name='input')

    # Hidden fully connected layer with 256 neurons  # can have `name` parameter
    hidden_1 = tf.layers.dense(inputs=input_layer, units=n_hidden_1, activation=tf.nn.relu, name='hidden-1')
    hidden_2 = tf.layers.dense(inputs=hidden_1, units=n_hidden_2, activation=tf.nn.relu, name='hidden-2')
    hidden_3 = tf.layers.dense(inputs=hidden_2, units = n_hidden_3, activation=tf.nn.relu, name='hidden-3')

    # Output fully connected layer with a neuron for each class
    out_layer = tf.layers.dense(inputs=hidden_3, units=num_classes, name='output')

    return out_layer

MODEL_PATH = '' #Path to .aim zip file
sess = Checkpoint.load(MODEL_PATH)
sess = sess[1]
print(TfUtils.get_weights(TfUtils.get_tf_t_vars(sess), sess))