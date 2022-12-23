from aim.ray_tune import AimCallback
import numpy as np

from ray import tune
from ray.air import session
from ray import air, tune


def train_function(config):
    for _ in range(30):
        loss = config["mean"] + config["sd"] * np.random.randn()
        session.report({"loss": loss})


def tune_with_callback():
    """Example for using a AimCallback with the function API"""
    tuner = tune.Tuner(
        train_function,
        tune_config=tune.TuneConfig(
            metric="loss",
            mode="min",
        ),
        run_config=air.RunConfig(
            callbacks=[
                AimCallback(repo=".ray_tune", experiment_name="ray tune example", as_multirun=True)
            ]
        ),
        param_space={
            "mean": tune.grid_search([1, 2, 3, 4, 5]),
            "sd": tune.uniform(0.2, 0.8),
        },
    )
    tuner.fit()


tune_with_callback()
