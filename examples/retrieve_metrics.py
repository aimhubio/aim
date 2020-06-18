import os

from aim.artifacts.proto.base_pb2 import BaseRecord
from aim.artifacts.proto.metric_pb2 import MetricRecord

from aimrecords import Storage


storage_path = os.path.join(os.getcwd(),
                            '.aim', 'new-data-model', 'index', 'objects')
storage = Storage(storage_path, 'r')

storage.open('loss')
for r in storage.read_records('loss', slice(None, None)):
    base_pb = BaseRecord()
    base_pb.ParseFromString(r)
    metric_pb = MetricRecord()
    metric_pb.ParseFromString(base_pb.artifact)
    print('loss', base_pb, metric_pb)

storage.open('accuracy')
for r in storage.read_records('accuracy', slice(None, None)):
    base_pb = BaseRecord()
    base_pb.ParseFromString(r)
    metric_pb = MetricRecord()
    metric_pb.ParseFromString(base_pb.artifact)
    print('accuracy', base_pb, metric_pb)

storage.close()
