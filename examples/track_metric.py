import random
import aim

sess = aim.Session(experiment='test_2_metrics')

# sess.set_params({'key': random.random()})

for _ in range(100):
    sess.track(random.random(), name='metric')
