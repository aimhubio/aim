from aim import Profiler
import tensorflow as tf


# Create model
def neural_net(x, weights, biases):
    # Hidden fully connected layer with 256 neurons
    layer_1 = tf.add(tf.matmul(x, weights['h1']), biases['b1'])

    # Hidden fully connected layer with 256 neurons
    layer_2 = Profiler.tf.label('layer2', inp=layer_1)
    layer_2 = tf.add(tf.matmul(layer_2, weights['h2']), biases['b2'])
    layer_2 = Profiler.tf.loop('layer2', inp=layer_2)

    # Output fully connected layer with a neuron for each class
    out_layer = Profiler.tf.label('output', inp=layer_2)
    out_layer = tf.matmul(out_layer, weights['out']) + biases['out']
    out_layer = Profiler.tf.loop('output', inp=out_layer, gradient=True)

    return out_layer
