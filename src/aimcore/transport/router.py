import datetime
import os

from fastapi import APIRouter

from aim._sdk.repo import Repo
from aimcore.transport.config import AIM_SERVER_MOUNTED_REPO_PATH


class ClientRouter:
    client_heartbeat_pool = dict()
    clients = []
    repo = None

    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route('/get-version/', self.get_version, methods=['GET'])
        self.router.add_api_route('/heartbeat/{client_uri}/', self.heartbeat, methods=['GET'])
        self.router.add_api_route('/connect/{client_uri}/', self.connect, methods=['GET'])
        self.router.add_api_route('/reconnect/{client_uri}/', self.reconnect, methods=['GET'])
        self.router.add_api_route('/disconnect/{client_uri}/', self.disconnect, methods=['GET'])

    @classmethod
    def add_client(cls, client_uri):
        cls.clients.append(client_uri)

    @classmethod
    def remove_client(cls, client_uri):
        if client_uri in cls.clients:
            cls.clients.remove(client_uri)
        if client_uri in cls.client_heartbeat_pool:
            del cls.client_heartbeat_pool[client_uri]

    async def get_version(self):
        from aim.__version__ import __version__ as aim_version

        return {'version': aim_version}

    async def heartbeat(self, client_uri):
        self.client_heartbeat_pool[client_uri] = datetime.datetime.now().timestamp()

    async def connect(self, client_uri):
        if not self.repo:
            repo_path = os.environ.get(AIM_SERVER_MOUNTED_REPO_PATH)
            self.repo = Repo.from_path(repo_path, read_only=False)
        self.add_client(client_uri)

    async def reconnect(self, client_uri):
        if client_uri not in self.clients:
            self.add_client(client_uri)

    async def disconnect(self, client_uri):
        self.remove_client(client_uri)
