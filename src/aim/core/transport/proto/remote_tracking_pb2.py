import google.protobuf

protobuf_version = google.protobuf.__version__[0]

if protobuf_version == "3":
    from aim.core.transport.proto.v3.remote_tracking_pb2 import *
elif protobuf_version == "4":
    from aim.core.transport.proto.v4.remote_tracking_pb2 import *
