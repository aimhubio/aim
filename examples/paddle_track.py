import paddle
import paddle.vision.transforms as T
from paddle.static import InputSpec
from aim.paddle import AimCallback


inputs = [InputSpec([-1, 1, 28, 28], 'float32', 'image')]
labels = [InputSpec([None, 1], 'int64', 'label')]

transform = T.Compose([
    T.Transpose(),
    T.Normalize([127.5], [127.5])
])
train_dataset = paddle.vision.datasets.MNIST(mode='train', transform=transform)
eval_dataset = paddle.vision.datasets.MNIST(mode='test', transform=transform)

net = paddle.vision.models.LeNet()
model = paddle.Model(net, inputs, labels)

optim = paddle.optimizer.Adam(0.001, parameters=net.parameters())
model.prepare(optimizer=optim,
              loss=paddle.nn.CrossEntropyLoss(),
              metrics=paddle.metric.Accuracy())

callback = AimCallback(repo='.', experiment_name='paddle_test')
model.fit(train_dataset, eval_dataset, batch_size=64, callbacks=callback)
