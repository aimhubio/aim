from aim.ext.cleanup import AutoClean
from aim.ext.transport.client import Client


class RemoteResourceAutoClean(AutoClean):
    def __init__(self, instance):
        super().__init__(instance)
        self.handler = None
        self.rpc_client: Client = None

    def _close(self):
        if self.handler is not None:
            assert self.rpc_client is not None
            self.rpc_client.release_resource(self.handler)
