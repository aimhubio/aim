from aim.sb3 import AimCallback
from stable_baselines3 import A2C


model = A2C('MlpPolicy', 'CartPole-v1', verbose=2)
model.learn(total_timesteps=10_000, callback=AimCallback(experiment_name='example_experiment'))
