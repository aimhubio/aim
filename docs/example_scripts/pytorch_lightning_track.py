from argparse import ArgumentParser

import pytorch_lightning as pl
import torch
from aimstack.ml.integrations.pytorch_lightning import AimLogger
from torch.nn import functional as F
from torch.utils.data import DataLoader, random_split

try:
    from torchvision import transforms
    from torchvision.datasets.mnist import MNIST
except Exception as e:
    from tests.base.datasets import MNIST


class LitClassifier(pl.LightningModule):
    def __init__(self, hidden_dim=128, learning_rate=1e-3):
        super().__init__()
        self.save_hyperparameters()

        self.l1 = torch.nn.Linear(28 * 28, self.hparams.hidden_dim)
        self.l2 = torch.nn.Linear(self.hparams.hidden_dim, 10)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = torch.relu(self.l1(x))
        x = torch.relu(self.l2(x))
        return x

    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = F.cross_entropy(y_hat, y)
        self.log("train_loss", loss)
        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = F.cross_entropy(y_hat, y)
        self.log("val_loss", loss)

    def test_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = F.cross_entropy(y_hat, y)
        self.log("test_loss", loss)
        # Track metrics manually
        self.logger.experiment.track_auto(1, name="manually_tracked_metric")

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=self.hparams.learning_rate)


if __name__ == "__main__":
    pl.seed_everything(1234)

    # instantiate argument parser
    parser = ArgumentParser()
    parser.add_argument("--batch_size", default=32, type=int)
    parser.add_argument("--hidden_dim", type=int, default=128)
    parser.add_argument("--learning_rate", type=float, default=0.0001)
    # parser = pl.Trainer.add_argparse_args(parser)
    args = parser.parse_args()

    # Load MNSIST dataset, and get the test and train splits
    dataset = MNIST("", train=True, download=True, transform=transforms.ToTensor())
    mnist_test = MNIST("", train=False, download=True, transform=transforms.ToTensor())
    mnist_train, mnist_val = random_split(dataset, [55000, 5000])

    train_loader = DataLoader(mnist_train, batch_size=args.batch_size)
    val_loader = DataLoader(mnist_val, batch_size=args.batch_size)
    test_loader = DataLoader(mnist_test, batch_size=args.batch_size)

    # initialize the earlier created LitClassifier model
    model = LitClassifier(args.hidden_dim, args.learning_rate)

    # create AimLogger and call the fit to start the training
    aim_logger = AimLogger(
        experiment_name="pt_lightning_exp",
        train_metric_prefix="train_",
        test_metric_prefix="test_",
        val_metric_prefix="val_",
    )
    trainer = pl.Trainer(logger=aim_logger)
    trainer.fit(model, train_loader, val_loader)

    # run evaluation on test dataset
    trainer.test(dataloaders=test_loader)
