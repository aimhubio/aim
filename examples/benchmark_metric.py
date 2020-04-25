from aim import track
import aim

aim.init(True)

for i in range(100000):
    track(aim.metric, 'metric', i)
