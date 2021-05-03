from aim.web.artifacts.proto.base_pb2 import BaseRecord
from aim.web.artifacts.proto.metric_pb2 import MetricRecord


class Artifact(object):
    PB_GEN_MSG = None

    @classmethod
    def deserialize(cls, data):
        base_pb = BaseRecord()
        base_pb.ParseFromString(data)

        artifact_pb = cls.PB_GEN_MSG()
        artifact_pb.ParseFromString(base_pb.artifact)

        return base_pb, artifact_pb


class Metric(Artifact):
    PB_GEN_MSG = MetricRecord
