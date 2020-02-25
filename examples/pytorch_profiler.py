from functools import reduce
import time
import random

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms

from aim import Profiler
Profiler.init(auto_detect_cycles=False, aggregate=Profiler.MEAN)

# Device configuration
device = torch.device('cpu')

# Hyper parameters
num_epochs = 5
num_classes = 10
batch_size = 50
learning_rate = 0.01

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
        Profiler.label('layer1')
        out = self.layer1(x)
        Profiler.loop('layer1')

        # Profiler.label('computation')
        # reduce(lambda a, b: a*b, range(int((random.random() * 50000) + 50000)))
        # Profiler.loop('computation')

        Profiler.label('layer2')
        out = self.layer2(out)
        Profiler.loop('layer2')

        Profiler.label('reshape_layer')
        out = out.reshape(out.size(0), -1)
        Profiler.loop('reshape_layer')

        for j in range(10):
            Profiler.label('cond_sleep')
            if j == 5:
                reduce(lambda a, b: a * b,
                       range(int((random.random() * 50000) + 50000)))
            else:
                time.sleep(0.1)
            Profiler.loop('cond_sleep')

        out = self.fc(out)

        Profiler.cycle()

        return out


model = ConvNet(num_classes).to(device)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

# Train the model
saved_img = 0
total_step = len(train_loader)
for epoch in range(num_epochs):
    false_positives = 0
    false_negatives = 0
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

        if (i + 1) % 100 == 0:
            print('Epoch [{}/{}], Step [{}/{}], '
                  'Loss: {:.4f}'.format(epoch + 1, num_epochs, i + 1,
                                        total_step, loss.item()))
