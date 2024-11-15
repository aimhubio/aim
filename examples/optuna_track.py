import optuna

from aim.optuna import AimCallback


# ------------------------------------------------ Version 1: Single Run ------------------------------------------------

# Add Aim callback to Optuna optimization
aim_callback = AimCallback(experiment_name='example_experiment_single_run')


def objective(trial):
    x = trial.suggest_float('x', -10, 10)
    return (x - 2) ** 2


study = optuna.create_study()
study.optimize(objective, n_trials=10, callbacks=[aim_callback])


# ------------------------------------------------ Version 2: Multi Run with decorator ----------------------------------

# Aim logging in multirun mode.
aim_callback = AimCallback(as_multirun=True, experiment_name='example_experiment_multi_run_with_decorator')


@aim_callback.track_in_aim()
def objective(trial):
    x = trial.suggest_float('x', -10, 10)
    aim_callback.experiment.track(2, name='power')
    aim_callback.experiment.track(x - 2, name='base of metric')

    return (x - 2) ** 2


study = optuna.create_study()
study.optimize(objective, n_trials=10, callbacks=[aim_callback])
