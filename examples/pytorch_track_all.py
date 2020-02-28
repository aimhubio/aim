import aim
from aim import track

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
from torch.optim.lr_scheduler import ReduceLROnPlateau

# Device configuration
device = torch.device('cpu')

# Hyper parameters
num_epochs = 5
num_classes = 10
batch_size = 50
learning_rate = 0.01

# aim - Track hyper parameters
track(aim.hyperparams, {
    'num_epochs': num_epochs,
    'num_classes': num_classes,
    'batch_size': batch_size,
    'learning_rate': learning_rate,
})

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
optimizer = torch.optim.SGD([
        {'params': model.layer1[0].parameters(), 'lr': 0.1},
        {'params': model.layer1[1:].parameters(), 'lr': 0.05},
        {'params': model.layer2[0].parameters(), 'lr': 0.01},
        {'params': model.layer2[1:].parameters(), 'lr': 0.005},
        {'params': model.fc.parameters(), 'lr': 0.001},
    ], lr=0.001, momentum=0.9)

scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.1, patience=0)

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

            # aim - Track model loss function
            scheduler.step(loss)
            track(aim.loss, 'loss', loss.item())

            track(aim.learning_rate, optimizer, [
                'layer1_conv',
                'layer1_act',
                'layer2_conv',
                'layer2_act',
                'fc',
            ])

            # aim - Track model accuracy
            correct = 0
            total = 0
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            track(aim.accuracy, 'accuracy', 100 * correct / total)

            # aim - Track last layer correlation
            track(aim.label_correlation, 'corr', outputs, labels=[
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            ])

            # aim - Track model weights and gradients
            track(aim.weights, model)
            track(aim.gradients, model)

        for l in range(len(labels)):
            for o in range(len(outputs)):
                if labels[l].item() == outputs[o].argmax().item() and l != o:
                    # count fp
                    false_positives += 1

        for l in range(len(labels)):
            if labels[l].item() != outputs[l].argmax().item():
                # count fn
                false_negatives += 1

                # track images
                if epoch >= 2 and saved_img < 50:
                    saved_img += 1
                    # aim - Track misclassified images
                    img = track(aim.image, images[l])
                    track(aim.misclassification, 'miscls', img,
                          labels[l].item(),
                          outputs[l].argmax().item())

    learning_rate /= 2

    # aim - Track model checkpoints
    track(aim.checkpoint,
          'checkpoint_test', 'chp_epoch_{}'.format(epoch),
          model, epoch, lr_rate=learning_rate,
          meta={
              'learning_rate': learning_rate,
              'false_positives': false_positives,
              'false_negatives': false_negatives,
              'drop_out': 0.5,
              'batch_size': 10,
              'kernel_size': 2,
              'stride': 2,
          })

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
