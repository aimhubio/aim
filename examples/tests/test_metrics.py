import aim
import random
import os


exp1_run1 = aim.Session(experiment='test_metrics', flush_frequency=10)
exp1_run2 = aim.Session(experiment='test_metrics', flush_frequency=10)
exp2 = aim.Session(experiment='test_metrics_2', flush_frequency=10)

print(os.getpid(), exp1_run1.run_hash, exp1_run2.run_hash, exp2.run_hash)

exp1_run1.set_params({
    'foo': random.random() * 100,
    'bar': random.random() * 100,
    'baz': random.random() * 100,
})
exp1_run2.set_params({
    'foo': random.random() * 100,
    'bar': random.random() * 100,
    'baz': random.random() * 100,
})
exp2.set_params({
    'foo': random.random() * 100,
    'bar': random.random() * 100,
    'baz': random.random() * 100,
})

for i in range(100, 200):
    # Experiment 1, run 1
    exp1_run1.track(i, name='metric_2')
    exp1_run1.track(i*2, name='metric', subset='train', foo='baz')
    exp1_run1.track(i*3, name='metric_2', subset='test', bar='baz')

    # Experiment 1, run 2
    exp1_run2.track(i, name='metric_2')
    exp1_run2.track(i*2, name='metric', subset='test', subtask='task_1')
    exp1_run2.track(i*3, name='metric_2', subset='test')
    exp1_run2.track(i*2, name='metric', subtask='task_1', subset='test')

    # Experiment 2
    exp2.track(i, name='metric_2')
