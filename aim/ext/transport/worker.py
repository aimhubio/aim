import datetime
from multiprocessing import Process
import aim.ext.transport.remote_tracking_pb2_grpc as remote_tracking_pb2_grpc


class RemoteWorker:
    def __init__(self, host, port, ssl_keyfile, ssl_certfile):
        from aim.ext.transport.server import run_server
        self._process = Process(target=run_server, args=(host, port, ssl_keyfile, ssl_certfile))
        self._host = host
        self._port = port
        self._ssl_keyfile = ssl_keyfile
        self._ssl_certfile = ssl_certfile
        self._start_time = None
        self._clients = []

    def start(self):
        self._process.start()
        self._start_time = datetime.datetime.now()

    def stop(self):
        self._process.join()

    def restart(self):
        self.stop()
        self.start()

    def add_client(self, client_uri):
        self._clients.append(client_uri)

    def remove_client(self, client_uri):
        if client_uri in self._clients:
            self._clients.remove(client_uri)

    @property
    def start_time(self):
        return self._start_time

    @property
    def host(self):
        return self._host

    @property
    def port(self):
        return self._port

    @property
    def address(self):
        return f'{self._host}:{self._port}'

    @property
    def client_count(self):
        return len(self._clients)

    def cleanup_client_resources(self, client_uri):
        import grpc

        if self._ssl_certfile:
            with open(self._ssl_certfile, 'rb') as f:
                root_certificates = grpc.ssl_channel_credentials(f.read())
            _remote_worker_channel = grpc.secure_channel(self.address, root_certificates)
        else:
            _remote_worker_channel = grpc.insecure_channel(self.address)

        _remote_worker_stub = remote_tracking_pb2_grpc.RemoteTrackingServiceStub(_remote_worker_channel)

        _remote_worker_stub.cleanup_client_resources(client_uri)
