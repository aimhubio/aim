from typing import Optional

import dm_env

from acme import specs, wrappers
from acme.agents.jax import d4pg
from acme.jax import experiments
from acme.utils import loggers
from aim.sdk.acme import AimCallback, AimWriter
from dm_control import suite as dm_suite


def make_environment(seed: int) -> dm_env.Environment:
    environment = dm_suite.load('cartpole', 'balance')

    # Make the observations be a flat vector of all concatenated features.
    environment = wrappers.ConcatObservationWrapper(environment)

    # Wrap the environment so the expected continuous action spec is [-1, 1].
    # Note: this is a no-op on 'control' tasks.
    environment = wrappers.CanonicalSpecWrapper(environment, clip=True)

    # Make sure the environment outputs single-precision floats.
    environment = wrappers.SinglePrecisionWrapper(environment)

    return environment


def network_factory(spec: specs.EnvironmentSpec) -> d4pg.D4PGNetworks:
    return d4pg.make_networks(
        spec,
        # These correspond to sizes of the hidden layers of an MLP.
        policy_layer_sizes=(256, 256),
        critic_layer_sizes=(256, 256),
    )


d4pg_config = d4pg.D4PGConfig(learning_rate=3e-4, sigma=0.2)
d4pg_builder = d4pg.D4PGBuilder(d4pg_config)


aim_run = AimCallback(experiment='example_experiment')


def logger_factory(
    name: str,
    steps_key: Optional[str] = None,
    task_id: Optional[int] = None,
) -> loggers.Logger:
    return AimWriter(aim_run, name, steps_key, task_id)


experiment_config = experiments.ExperimentConfig(
    builder=d4pg_builder,
    environment_factory=make_environment,
    network_factory=network_factory,
    logger_factory=logger_factory,
    seed=0,
    max_num_actor_steps=5000,
)  # Each episode is 1000 steps.


experiments.run_experiment(experiment=experiment_config, eval_every=1000, num_eval_episodes=1)
