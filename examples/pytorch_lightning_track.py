import importlib.util
import os


if importlib.util.find_spec('lightning'):
    import lightning.pytorch as pl
elif importlib.util.find_spec('pytorch_lightning'):  # F401
    import pytorch_lightning as pl
else:
    raise RuntimeError(
        'This contrib module requires PyTorch Lightning to be installed. '
        'Please install it with command: \n pip install pytorch-lightning \n'
        'or \n pip install lightning'
    )
from aim.pytorch_lightning import AimLogger
from torch import nn, optim, utils
from torchvision.datasets import MNIST
from torchvision.transforms import ToTensor


# define any number of nn.Modules (or use your current ones)
encoder = nn.Sequential(nn.Linear(28 * 28, 128), nn.ReLU(), nn.Linear(128, 3))
decoder = nn.Sequential(nn.Linear(3, 128), nn.ReLU(), nn.Linear(128, 28 * 28))


# define the LightningModule
class LitAutoEncoder(pl.LightningModule):
    def __init__(self, encoder, decoder):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder

    def training_step(self, batch, batch_idx):
        # training_step defines the train loop.
        # it is independent of forward
        x, y = batch
        x = x.view(x.size(0), -1)
        z = self.encoder(x)
        x_hat = self.decoder(z)
        loss = nn.functional.mse_loss(x_hat, x)
        # Logging to TensorBoard (if installed) by default
        self.log('train_loss', loss)
        return loss

    def test_step(self, batch, batch_idx):
        # test_step defines the test loop.
        # it is independent of forward
        x, y = batch
        x = x.view(x.size(0), -1)
        z = self.encoder(x)
        x_hat = self.decoder(z)
        loss = nn.functional.mse_loss(x_hat, x)
        # Logging to TensorBoard (if installed) by default
        self.log('test_loss', loss)
        return loss

    def configure_optimizers(self):
        optimizer = optim.Adam(self.parameters(), lr=1e-3)
        return optimizer


# init the autoencoder
autoencoder = LitAutoEncoder(encoder, decoder)


# setup data
dataset = MNIST(os.getcwd(), train=True, download=True, transform=ToTensor())
train_dataset, val_dataset = utils.data.random_split(dataset, [55000, 5000])
test_dataset = MNIST(os.getcwd(), train=False, download=True, transform=ToTensor())

train_loader = utils.data.DataLoader(train_dataset)
val_loader = utils.data.DataLoader(val_dataset)
test_loader = utils.data.DataLoader(test_dataset)


# create AimLogger and call the fit to start the training
aim_logger = AimLogger(
    experiment='example_experiment',
)


trainer = pl.Trainer(limit_train_batches=100, max_epochs=5, logger=aim_logger)
trainer.fit(model=autoencoder, train_dataloaders=train_loader, val_dataloaders=val_loader)

trainer.test(dataloaders=test_loader)
