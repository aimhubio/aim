import ignite
import torch
import torch.nn.functional as F

from aim.pytorch_ignite import AimLogger
from ignite.contrib.handlers import ProgressBar
from ignite.engine import Events, create_supervised_evaluator, create_supervised_trainer
from ignite.handlers import EarlyStopping, global_step_from_engine
from ignite.metrics import Accuracy, ConfusionMatrix, Loss, RunningAverage
from torch import nn, optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms


# transform to normalize the data
transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])

# Download and load the training data
trainset = datasets.FashionMNIST('./data', download=True, train=True, transform=transform)
train_loader = DataLoader(trainset, batch_size=64, shuffle=True)

# Download and load the test data
validationset = datasets.FashionMNIST('./data', download=True, train=False, transform=transform)
val_loader = DataLoader(validationset, batch_size=64, shuffle=True)


class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()

        self.convlayer1 = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        self.convlayer2 = nn.Sequential(nn.Conv2d(32, 64, 3), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2))

        self.fc1 = nn.Linear(64 * 6 * 6, 600)
        self.drop = nn.Dropout2d(0.25)
        self.fc2 = nn.Linear(600, 120)
        self.fc3 = nn.Linear(120, 10)

    def forward(self, x):
        x = self.convlayer1(x)
        x = self.convlayer2(x)
        x = x.view(-1, 64 * 6 * 6)
        x = self.fc1(x)
        x = self.drop(x)
        x = self.fc2(x)
        x = self.fc3(x)

        return F.log_softmax(x, dim=1)


# creating model,and defining optimizer and loss
model = CNN()
# moving model to gpu if available
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
model.to(device)
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.NLLLoss()


# defining the number of epochs
epochs = 12
# creating trainer,evaluator
trainer = create_supervised_trainer(model, optimizer, criterion, device=device)
metrics = {
    'accuracy': Accuracy(),
    'nll': Loss(criterion),
    'cm': ConfusionMatrix(num_classes=10),
}
train_evaluator = create_supervised_evaluator(model, metrics=metrics, device=device)
val_evaluator = create_supervised_evaluator(model, metrics=metrics, device=device)

RunningAverage(output_transform=lambda x: x).attach(trainer, 'loss')


def score_function(engine):
    val_loss = engine.state.metrics['nll']
    return -val_loss


handler = EarlyStopping(patience=10, score_function=score_function, trainer=trainer)
val_evaluator.add_event_handler(Events.COMPLETED, handler)


@trainer.on(Events.EPOCH_COMPLETED)
def log_validation_results(trainer):
    train_evaluator.run(train_loader)
    val_evaluator.run(val_loader)


# Create a logger
aim_logger = AimLogger()

# Log experiment parameters:
aim_logger.log_params(
    {
        'model': model.__class__.__name__,
        'pytorch_version': str(torch.__version__),
        'ignite_version': str(ignite.__version__),
    }
)

# Attach the logger to the trainer to log training loss at each iteration
aim_logger.attach_output_handler(
    trainer,
    event_name=Events.ITERATION_COMPLETED,
    tag='train',
    output_transform=lambda loss: {'loss': loss},
)

# Attach the logger to the evaluator on the training dataset and log NLL, Accuracy metrics after each epoch
# We setup `global_step_transform=global_step_from_engine(trainer)` to take the epoch
# of the `trainer` instead of `train_evaluator`.
aim_logger.attach_output_handler(
    train_evaluator,
    event_name=Events.EPOCH_COMPLETED,
    tag='train',
    metric_names=['nll', 'accuracy'],
    global_step_transform=global_step_from_engine(trainer),
)

# Attach the logger to the evaluator on the validation dataset and log NLL, Accuracy metrics after
# each epoch. We setup `global_step_transform=global_step_from_engine(trainer)` to take the epoch of the
# `trainer` instead of `evaluator`.
aim_logger.attach_output_handler(
    val_evaluator,
    event_name=Events.EPOCH_COMPLETED,
    tag='val',
    metric_names=['nll', 'accuracy'],
    global_step_transform=global_step_from_engine(trainer),
)

# Attach the logger to the trainer to log optimizer's parameters, e.g. learning rate at each epoch iteration
aim_logger.attach_opt_params_handler(
    trainer,
    event_name=Events.EPOCH_STARTED,
    optimizer=optimizer,
    param_name='lr',  # optional
)

pbar = ProgressBar(persist=True, bar_format='')
pbar.attach(trainer, ['loss'])

trainer.run(train_loader, max_epochs=epochs)
