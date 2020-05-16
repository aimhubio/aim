import aim
from aim import track

for i in range(10):
    track(aim.text, "document_name", "text{index}".format(index=i))
