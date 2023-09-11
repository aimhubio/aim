import optuna
from aimstack.ml.integrations.optuna import AimCallback

# Add Aim callback to Optuna optimization
aim_callback = AimCallback(experiment_name="optuna_single_run")


def objective(trial):
    x = trial.suggest_float("x", -10, 10)
    return (x - 2) ** 2


study = optuna.create_study()
study.optimize(objective, n_trials=10, callbacks=[aim_callback])


# Aim logging in multirun mode.
aim_callback = AimCallback(
    as_multirun=True, experiment_name="optuna_multy_run_with_decorator"
)


@aim_callback.track_in_aim()
def objective(trial):
    x = trial.suggest_float("x", -10, 10)
    aim_callback.experiment.track_auto(2, name="power")
    aim_callback.experiment.track_auto(x - 2, name="base of metric")

    return (x - 2) ** 2


study = optuna.create_study()
study.optimize(objective, n_trials=10, callbacks=[aim_callback])
