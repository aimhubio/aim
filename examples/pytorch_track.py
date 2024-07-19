import logging

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms

from aim import Run
from aim.pytorch import track_gradients_dists, track_params_dists


# Initialize a new Run
aim_run = Run(capture_terminal_logs=True)

logging.getLogger()

# moving model to gpu if available
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

# Hyper parameters
num_epochs = 5
num_classes = 10
batch_size = 32
learning_rate = 0.001

# aim - Track hyper parameters
aim_run['hparams'] = {
    'num_epochs': num_epochs,
    'num_classes': num_classes,
    'batch_size': batch_size,
    'learning_rate': learning_rate,
}

# MNIST dataset
train_dataset = torchvision.datasets.MNIST(root='./data/', train=True, transform=transforms.ToTensor(), download=True)

test_dataset = torchvision.datasets.MNIST(root='./data/', train=False, transform=transforms.ToTensor())

# Data loader
train_loader = torch.utils.data.DataLoader(dataset=train_dataset, batch_size=batch_size, shuffle=True)

test_loader = torch.utils.data.DataLoader(dataset=test_dataset, batch_size=batch_size, shuffle=False)


# Convolutional neural network (one convolutional layer)
class ConvNet(nn.Module):
    def __init__(self, num_classes=10):
        super(ConvNet, self).__init__()
        self.layer1 = nn.Sequential(
            nn.Conv2d(1, 2, kernel_size=5, stride=1, padding=2),
            nn.BatchNorm2d(2),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        self.fc = nn.Linear(2 * 14 * 14, num_classes)

    def forward(self, x):
        out = self.layer1(x)
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

        
        aim_run.log_info(
            f"Epoch [{epoch+1}/{num_epochs}], Step [{i+1}/{total_step}], Train Loss: {loss.item():.4f}"
            )

        correct = 0
        total = 0
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        acc = 100 * correct / total

        if i % 30 == 0: 
            # aim - Track metrics
            items = {'accuracy': acc, 'loss': loss}
            aim_run.track(items, epoch=epoch, context={'subset': 'train'})

            # aim - Track weights and gradients distributions
            track_params_dists(model, aim_run)
            track_gradients_dists(model, aim_run)

    model.eval()
    for i, (images, labels) in enumerate(test_loader):
        images = images.to(device)
        labels = labels.to(device)

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        logging.info(
            f"Epoch [{epoch+1}/{num_epochs}], Step [{i+1}/{total_step}], Valid Loss: {loss.item():.4f}"
            )

        correct = 0
        total = 0
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
        acc = 100 * correct / total

        if i % 30 == 0:
            # aim - Track metrics
            items = {'accuracy': acc, 'loss': loss}
            aim_run.track(items, epoch=epoch, context={'subset': 'test'})

logging.info('Training finished')