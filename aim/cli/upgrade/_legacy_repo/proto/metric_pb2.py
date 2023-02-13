import google.protobuf

protobuf_version = google.protobuf.__version__[0]

if protobuf_version == "3":
    from aim.cli.upgrade._legacy_repo.proto.v3.metric_pb2 import *
elif protobuf_version == "4":
    from aim.cli.upgrade._legacy_repo.proto.v4.metric_pb2 import *
