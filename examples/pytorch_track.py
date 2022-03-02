from aim import Run
from aim.pytorch import track_gradients_dists, track_params_dists

import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms


# Initialize a new Run
aim_run = Run(log_system_params=True)

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

