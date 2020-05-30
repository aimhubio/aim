import aim
from aim import track

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
num_input = 784 # MNIST data input (img shape: 28*28)
num_classes = 10 # MNIST total classes (0-9 digits)

# tf Graph input
X = tf.placeholder("float", [None, num_input])
Y = tf.placeholder("float", [None, num_classes])

# Need only if layers are created NOT BY tf.layers object
# weights = tf.Variable(tf.random_normal([num_input, n_hidden_1]))
# biases = tf.Variable(tf.random_normal([n_hidden_1]))


def neural_net(x):
    # Input Layer
    input_layer = tf.layers.dense(inputs=x, units=num_input)

    # Hidden fully connected layer with 256 neurons  # can have `name` parameter
    hidden_1 = tf.layers.dense(inputs=input_layer, units=n_hidden_1, activation=tf.nn.relu)
    hidden_2 = tf.layers.dense(inputs=hidden_1, units=n_hidden_2, activation=tf.nn.relu)

    # Output fully connected layer with a neuron for each class
    out_layer = tf.layers.dense(inputs=hidden_2, units=num_classes)

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

    for e in range(10):
        for step in range(1, num_steps+1):
            batch_x, batch_y = mnist.train.next_batch(batch_size)
            # Run optimization op (backprop)
            sess.run(train_op, feed_dict={X: batch_x, Y: batch_y})
            if step % display_step == 0 or step == 1:
                # Calculate batch loss and accuracy
                loss, acc = sess.run([loss_op, accuracy], feed_dict={X: batch_x,
                                                                     Y: batch_y,
                                                                     })
                t_vars = tf.trainable_variables()
                params = sess.run(t_vars)
                track(aim.weights, zip(t_vars, params))
                print("Step " + str(step) + ", Epoch " + str(e+1) +
                      ", Minibatch Loss= " +
                      "{:.4f}".format(loss) + ", Training Accuracy= " +
                      "{:.3f}".format(acc))
    print("Optimization Finished!")

    # Calculate accuracy for MNIST test images
    print("Testing Accuracy:", \
        sess.run(accuracy, feed_dict={X: mnist.test.images,
                                      Y: mnist.test.labels}))


