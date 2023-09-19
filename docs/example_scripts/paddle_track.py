import paddle
from aimstack.ml.integrations.paddle import AimCallback
from paddle.vision.transforms import ToTensor

train_dataset = paddle.vision.datasets.MNIST(mode="train", transform=ToTensor())
test_dataset = paddle.vision.datasets.MNIST(mode="test", transform=ToTensor())
lenet = paddle.vision.models.LeNet()

model = paddle.Model(lenet)

model.prepare(
    optimizer=paddle.optimizer.Adam(0.001, parameters=lenet.parameters()),
    loss=paddle.nn.CrossEntropyLoss(),
    metrics=paddle.metric.Accuracy(),
)

callback = AimCallback(experiment_name="paddle_test")
model.fit(train_dataset, test_dataset, batch_size=64, callbacks=callback)
