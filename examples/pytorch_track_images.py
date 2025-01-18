import logging

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms

from aim import Run
from aim.sdk.objects.image import convert_to_aim_image_list
from tqdm import tqdm


# Initialize a new Run
aim_run = Run()

# moving model to gpu if available
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

# Hyper parameters
num_epochs = 5
num_classes = 10
batch_size = 50
learning_rate = 0.01

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


# Convolutional neural network (two convolutional layers)
class ConvNet(nn.Module):
    def __init__(self, num_classes=10):
        super(ConvNet, self).__init__()
        self.layer1 = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=5, stride=1, padding=2),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        self.layer2 = nn.Sequential(
            nn.Conv2d(16, 32, kernel_size=5, stride=1, padding=2),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
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

tensor_to_pil = transforms.ToPILImage()

# Train the model
total_step = len(train_loader)
for epoch in range(num_epochs):
    for i, (images, labels) in tqdm(enumerate(train_loader), total=len(train_loader)):
        images = images.to(device)
        labels = labels.to(device)
        aim_images = convert_to_aim_image_list(images, labels)

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if i % 30 == 0:
            logging.info(
                'Epoch [{}/{}], Step [{}/{}], Loss: {:.4f}'.format(
                    epoch + 1, num_epochs, i + 1, total_step, loss.item()
                )
            )

            # aim - Track model loss function
            aim_run.track(loss.item(), name='loss', epoch=epoch, context={'subset': 'train'})

            correct = 0
            total = 0
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            acc = 100 * correct / total

            # aim - Track metrics
            aim_run.track(acc, name='accuracy', epoch=epoch, context={'subset': 'train'})

            aim_run.track(aim_images, name='images', epoch=epoch, context={'subset': 'train'})

            # TODO: Do actual validation
            if i % 300 == 0:
                aim_run.track(loss, name='loss', epoch=epoch, context={'subset': 'val'})
                aim_run.track(acc, name='accuracy', epoch=epoch, context={'subset': 'val'})
                aim_run.track(aim_images, name='images', epoch=epoch, context={'subset': 'val'})


# Test the model
with torch.inference_mode():
    correct = 0
    total = 0
    for images, labels in tqdm(test_loader, total=len(test_loader)):
        images = images.to(device)
        labels = labels.to(device)
        outputs = model(images)
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    logging.info('Test Accuracy: {} %'.format(100 * correct / total))
