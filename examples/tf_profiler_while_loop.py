import time
import tensorflow as tf

# Import MNIST data
from tensorflow.examples.tutorials.mnist import input_data

import aim
aim.init(overwrite=True)

from aim import Profiler
Profiler.init(auto_detect_cycles=False, aggregate=Profiler.MAX)

mnist = input_data.read_data_sets('/tmp/data/', one_hot=True)

learning_rate = 0.1
num_steps = 500
batch_size = 128
display_step = 100

# Network Parameters
n_hidden_1 = 256
n_hidden_2 = 256
num_input = 784
num_classes = 10

# tf Graph input
X = tf.placeholder('float', [None, num_input])
Y = tf.placeholder('float', [None, num_classes])

# Store layers weight & bias
weights = {
    'h1': tf.Variable(tf.random_normal([num_input, n_hidden_1])),
    'h2': tf.Variable(tf.random_normal([n_hidden_1, n_hidden_2])),
    'out': tf.Variable(tf.random_normal([n_hidden_2, num_classes]))
}
biases = {
    'b1': tf.Variable(tf.random_normal([n_hidden_1])),
    'b2': tf.Variable(tf.random_normal([n_hidden_2])),
    'out': tf.Variable(tf.random_normal([num_classes]))
}


# Create model
def neural_net(x):
    # Hidden fully connected layer with 256 neurons
    layer_1 = tf.add(tf.matmul(x, weights['h1']), biases['b1'])

    def loop_body(b, index):
        layer = tf.add(tf.matmul(b, weights['h2']), biases['b2'])

        layer = Profiler.tf.label('denses', layer)
        layer = Profiler.tf.label('dense', layer)
        layer = tf.add(tf.matmul(layer, weights['h2']), biases['b2'])
        layer = Profiler.tf.loop('dense', layer)

        layer = Profiler.tf.label('dense2', layer)
        layer = tf.add(tf.matmul(layer, weights['h2']), biases['b2'])
        layer = Profiler.tf.loop('dense2', layer)
        layer = Profiler.tf.loop('denses', layer)

        layer = Profiler.tf.label('dense-out', layer)
        layer = tf.add(tf.matmul(layer, weights['h2']), biases['b2'])
        layer = Profiler.tf.loop('dense-out', layer)

        return layer, index + 1

    layer_2 = tf.add(tf.matmul(layer_1, weights['h2']), biases['b2'])

    layer_2, _ = tf.while_loop(lambda b, index: index < 8,
                               loop_body, [layer_2, 0])

    layer_2 = Profiler.tf.label('layer2', layer_2)
    layer_2 = tf.add(tf.matmul(layer_2, weights['h2']), biases['b2'])
    layer_2 = Profiler.tf.loop('layer2', layer_2)

    # Output fully connected layer with a neuron for each class
    out_layer = layer_2
    out_layer = Profiler.tf.label('output', out_layer)
    out_layer = tf.matmul(out_layer, weights['out']) + biases['out']
    out_layer = Profiler.tf.loop('output', out_layer)

    out_layer = Profiler.tf.cycle(out_layer)

    return out_layer


logits = neural_net(X)

# Define loss and optimizer
loss_op = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(
    logits=logits, labels=Y))
optimizer = tf.train.AdamOptimizer(learning_rate=learning_rate)
train_op = optimizer.minimize(loss_op)

# Evaluate model (with test logits, for dropout to be disabled)
correct_pred = tf.equal(tf.argmax(logits, 1), tf.argmax(Y, 1))
accuracy = tf.reduce_mean(tf.cast(correct_pred, tf.float32))

# Initialize the variables (i.e. assign their default value)
init = tf.global_variables_initializer()

with tf.Session() as sess:
    # Run the initializer
    sess.run(init)

    start_time = time.time()

    for e in range(4):
        for step in range(1, num_steps+1):
            batch_x, batch_y = mnist.train.next_batch(batch_size)
            # Run optimization op (backprop)
            sess.run(train_op, feed_dict={X: batch_x, Y: batch_y})

            if step % display_step == 0 or step == 1:
                # Calculate batch loss and accuracy
                loss, acc = sess.run([loss_op, accuracy], feed_dict={X: batch_x,
                                                                     Y: batch_y,
                                                                     })
                print('Step ' + str(step) + ', Epoch ' + str(e+1) +
                      ', Minibatch Loss= ' +
                      '{:.4f}'.format(loss) + ', Training Accuracy= ' +
                      '{:.3f}'.format(acc))

    end_time = time.time()

    print('Optimization Finished! Time: {}s'.format(end_time - start_time))

    # Calculate accuracy for MNIST test images
    print('Testing Accuracy:', sess.run(accuracy, feed_dict={
        X: mnist.test.images,
        Y: mnist.test.labels,
    }))
