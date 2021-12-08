from aim import Run, Distribution

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms


# Move to SDK/adapters/pytorch
# track_params_dists, track_gradients_dists, get_model_layers

def track_params_dists(model, run):
    data_hist = get_model_layers(model, 'data')

    for name, params in data_hist.items():
        if 'weight' in params:
            run.track(Distribution(params['weight']),
                      name=name,
                      context={
                          'type': 'data',
                          'params': 'weights',
                      })
        if 'bias' in params:
            run.track(Distribution(params['bias']),
                      name=name,
                      context={
                          'type': 'data',
                          'params': 'biases',
                      })


def track_gradients_dists(model, run):
    grad_hist = get_model_layers(model, 'grad')

    for name, params in grad_hist.items():
        if 'weight' in params:
            run.track(Distribution(params['weight']),
                      name=name,
                      context={
                          'type': 'gradients',
                          'params': 'weights',
                      })
        if 'bias' in params:
            run.track(Distribution(params['bias']),
                      name=name,
                      context={
                          'type': 'gradients',
                          'params': 'biases',
                      })


def get_model_layers(model, dt, parent_name=None):
    layers = {}
    for name, m in model.named_children():
        layer_name = '{}__{}'.format(parent_name, name) \
            if parent_name \
            else name
        layer_name += '.{}'.format(type(m).__name__)

        if len(list(m.named_children())):
            layers.update(get_model_layers(m, dt, layer_name))
        else:
            layers[layer_name] = {}
            if hasattr(m, 'weight') \
                    and m.weight is not None \
                    and hasattr(m.weight, dt):
                layers[layer_name]['weight'] = get_pt_tensor(getattr(m.weight, dt)).numpy()

            if hasattr(m, 'bias') \
                    and m.bias is not None \
                    and hasattr(m.bias, dt):
                layers[layer_name]['bias'] = get_pt_tensor(getattr(m.bias, dt)).numpy()

    return layers


# Move tensor from GPU to CPU
def get_pt_tensor(t):
    return t.cpu() if hasattr(t, 'is_cuda') and t.is_cuda else t


# Initialize a new Run
aim_run = Run()

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

            track_params_dists(model, aim_run)
            track_gradients_dists(model, aim_run)

            # TODO: Do actual validation
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

