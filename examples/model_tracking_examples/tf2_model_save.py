import aim
from aim import track
from aim.artifacts.utils import CheckpointCallback

import tensorflow as tf

# Load and prepare MNIST
mnist = tf.keras.datasets.mnist

(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0

# Create model
model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(28, 28)),
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(10)
])

track(aim.checkpoint, 'checkpoint-test',
     '0-mnist', model, 0,
      meta={
        'classes': 10,
      })

predictions = model(x_train[:1]).numpy()

tf.nn.softmax(predictions).numpy()

loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)

model.compile(optimizer='adam',
              loss=loss_fn,
              metrics=['accuracy'])

meta = {'classes': 10}

# Train model with checkpoints callbacks
model.fit(x_train, y_train, epochs=5,
          callbacks=[CheckpointCallback('checkpoint-test', 'mnist', meta)])

model.evaluate(x_test,  y_test, verbose=2)

