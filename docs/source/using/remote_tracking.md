## Track experiments with aim remote server (experimental feature)

### Overview

Aim remote tracking server allows running experiments in a multi-host environment and collect tracked data in a centralized location.
It provides SDK for client-server communications and utilized [gRPC](https://grpc.io/about/) protocol as its core transport layer.

In this guide we will show you how to setup Aim remote tracking server and how to integrate it in client-side code.

### Prerequisites

Remote tracking server assumes multi-host environments used to run multiple training experiments.
The machine running the server have to accept incoming TCP traffic on a dedicated port (default is 53800).

### Server-side setup

1. Make sure aim `3.4.0` or upper installed:
```shell
$ pip install "aim>=3.4.0"
```

2. Initialize `aim` repository (optional):

```shell
$ aim init
```

3. Run aim server with dedicated `aim` repository:

```shell
$ aim server --repo <REPO_PATH>
```

You will see the following output:
```shell
> Server is mounted on 0.0.0.0:53800
> Press Ctrl+C to exit
```
The server is up and ready to accept tracked data.

4. Run aim UI

```shell
$ aim up --repo <REPO_PATH>
```

### Client-side setup

With the current architecture there is almost no change in aim SDK usage. The only difference from tracking locally is
that you have to provide the remote tracking URL instead of local aim repo path. The following code shows how to create
`Run` with remote tracking URL and how to use it.

```python
from aim import Run

aim_run = Run(repo='aim://172.3.66.145:53800')  # replace example IP with your tracking server IP/hostname

# Log run parameters
aim_run['params'] = {
    'learning_rate': 0.001,
    'batch_size': 32,
}
...
```

You are now ready to use `aim_run` object to track your experiment results. Below is the full example using 
pytorch + aim remote tracking on MNIST dataset.

```python
from aim import Run

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms


# Initialize a new Run with remote tracking URL
aim_run = Run(repo='aim://172.3.66.145:53800')  # replace example IP with your tracking server IP/hostname

# Device configuration
device = torch.device('cpu')

# Hyper parameters
num_epochs = 5
num_classes = 10
batch_size = 16
learning_rate = 0.01

# aim - Track hyper parameters
aim_run['hparams'] = {
    'num_epochs': num_epochs,
    'num_classes': num_classes,
    'batch_size': batch_size,
    'learning_rate': learning_rate,
}

# MNIST dataset
train_dataset = torchvision.datasets.MNIST(root='./data/',
                                           train=True,
                                           transform=transforms.ToTensor(),
                                           download=True)

test_dataset = torchvision.datasets.MNIST(root='./data/',
                                          train=False,
                                          transform=transforms.ToTensor())

# Data loader
train_loader = torch.utils.data.DataLoader(dataset=train_dataset,
                                           batch_size=batch_size,
                                           shuffle=True)

test_loader = torch.utils.data.DataLoader(dataset=test_dataset,
                                          batch_size=batch_size,
                                          shuffle=False)


# Convolutional neural network (two convolutional layers)
class ConvNet(nn.Module):
    def __init__(self, num_classes=10):
        super(ConvNet, self).__init__()
        self.layer1 = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=5, stride=1, padding=2),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2))
        self.layer2 = nn.Sequential(
            nn.Conv2d(16, 32, kernel_size=5, stride=1, padding=2),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2))
        self.fc = nn.Linear(7 * 7 * 32, num_classes)

    def forward(self, x):
        out = self.layer1(x)
        out = self.layer2(out)
        out = out.reshape(out.size(0), -1)
        out = self.fc(out)
        return out


model = ConvNet(num_classes).to(device)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

# Train the model
total_step = len(train_loader)
for epoch in range(num_epochs):
    for i, (images, labels) in enumerate(train_loader):
        images = images.to(device)
        labels = labels.to(device)

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if i % 30 == 0:
            print('Epoch [{}/{}], Step [{}/{}], '
                  'Loss: {:.4f}'.format(epoch + 1, num_epochs, i + 1,
                                        total_step, loss.item()))

            # aim - Track model loss function
            aim_run.track(loss.item(), name='loss', epoch=epoch,
                          context={'subset':'train'})

            correct = 0
            total = 0
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            acc = 100 * correct / total

            # aim - Track metrics
            aim_run.track(acc, name='accuracy', epoch=epoch, context={'subset': 'train'})

            if i % 300 == 0:
                aim_run.track(loss.item(), name='loss', epoch=epoch, context={'subset': 'val'})
                aim_run.track(acc, name='accuracy', epoch=epoch, context={'subset': 'val'})


# Test the model
model.eval()
with torch.no_grad():
    correct = 0
    total = 0
    for images, labels in test_loader:
        images = images.to(device)
        labels = labels.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    print('Test Accuracy: {} %'.format(100 * correct / total))
```

### Conclusion

As you can see, aim remote tracking server allows running experiments on multiple hosts with simple setup and
minimal changes to your training code.
