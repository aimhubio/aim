import warnings

import mxnet as mx

from aim.mxnet import AimLoggingHandler
from mxnet import gluon
from mxnet.gluon.contrib.estimator import estimator
from mxnet.gluon.model_zoo import vision


gpu_count = mx.context.num_gpus()
ctx = [mx.gpu(i) for i in range(gpu_count)] if gpu_count > 0 else mx.cpu()


# Get the training data
fashion_mnist_train = gluon.data.vision.FashionMNIST(train=True)

# Get the validation data
fashion_mnist_val = gluon.data.vision.FashionMNIST(train=False)

transforms = [
    gluon.data.vision.transforms.Resize(224),  # We pick 224 as the model we use takes an input of size 224.
    gluon.data.vision.transforms.ToTensor(),
]

# Now we will stack all these together.
transforms = gluon.data.vision.transforms.Compose(transforms)

# Apply the transformations
fashion_mnist_train = fashion_mnist_train.transform_first(transforms)
fashion_mnist_val = fashion_mnist_val.transform_first(transforms)

batch_size = 256  # Batch size of the images
# The number of parallel workers for loading the data using Data Loaders.
num_workers = 4

train_data_loader = gluon.data.DataLoader(
    fashion_mnist_train, batch_size=batch_size, shuffle=True, num_workers=num_workers
)
val_data_loader = gluon.data.DataLoader(
    fashion_mnist_val, batch_size=batch_size, shuffle=False, num_workers=num_workers
)


model = vision.resnet18_v1(pretrained=False, classes=10)
model.initialize(init=mx.init.Xavier(), ctx=ctx)

loss_fn = gluon.loss.SoftmaxCrossEntropyLoss()

learning_rate = 0.04  # You can experiment with your own learning rate here
num_epochs = 2  # You can run training for more epochs
trainer = gluon.Trainer(model.collect_params(), 'sgd', {'learning_rate': learning_rate})


train_acc = mx.metric.Accuracy()  # Metric to monitor
train_loss = mx.metric.Loss()
val_acc = mx.metric.Accuracy()

# Define the estimator, by passing to it the model, loss function, metrics, trainer object and context
est = estimator.Estimator(
    net=model,
    loss=loss_fn,
    train_metrics=[train_acc, train_loss],
    val_metrics=val_acc,
    trainer=trainer,
    context=ctx,
)

aim_log_handler = AimLoggingHandler(
    experiment_name='example_experiment',
    log_interval=1,
    metrics=[train_acc, train_loss, val_acc],
)

# ignore warnings for nightly test on CI only
with warnings.catch_warnings():
    warnings.simplefilter('ignore')
    # Magic line
    est.fit(
        train_data=train_data_loader,
        val_data=val_data_loader,
        epochs=num_epochs,
        event_handlers=[aim_log_handler],
    )
