import aim
from aim import track, TrackCallBack
import numpy as np
import mnist
import keras
from keras.models import Sequential
from keras.layers import Dense
from keras.utils import to_categorical

"""
Citation for Keras Example Model: victorzhou.com/blog/keras-neural-network-tutorial/
"""



train_images = mnist.train_images()
train_labels = mnist.train_labels()
test_images = mnist.test_images()
test_labels = mnist.test_labels()

# Normalize the images.
train_images = (train_images / 255) - 0.5
test_images = (test_images / 255) - 0.5

# Flatten the images.
train_images = train_images.reshape((-1, 784))
test_images = test_images.reshape((-1, 784))

# Build the model.
model = Sequential([
  Dense(64, activation='relu', input_shape=(784,)),
  Dense(64, activation='relu'),
  Dense(10, activation='softmax'),
])

# Compile the model.
model.compile(
  optimizer='adam',
  loss='categorical_crossentropy',
  metrics=['accuracy'],
)

# Train the model.
model.fit(
  train_images,
  to_categorical(train_labels),
  epochs=5,
  batch_size=32,
  callbacks=[TrackCallBack(2)]
)

# Evaluate the model.
model.evaluate(
  test_images,
  to_categorical(test_labels)
)