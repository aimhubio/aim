from cryptography.fernet import Fernet
from typing import Iterator, List, Dict
from typing import TYPE_CHECKING

from aim._core.storage.encoding import encode_path, decode_path
from aim._core.storage.types import BLOB

if TYPE_CHECKING:
    from aim._core.storage.types import AimObjectPath
    from aim._core.storage.prefixview import PrefixView
    from aim._sdk.repo import Repo


class URIService:
    SEPARATOR = '__'

    def __init__(self, repo: 'Repo'):
        self.repo = repo
        self.encryptor = Fernet(repo.encryption_key)

    @staticmethod
    def generate_resource_path(prefix_view: 'PrefixView', additional_path: 'AimObjectPath') -> str:
        prefix_path = decode_path(prefix_view.prefix)
        encoded_path = encode_path((*prefix_path, *additional_path))
        return encoded_path.hex()

    def generate_uri(self, resource_path: str) -> str:
        return self.encryptor.encrypt(resource_path.encode()).decode()

    def decode_uri(self, uri: str) -> str:
        return self.encryptor.decrypt(uri.encode()).decode()

    def request_batch(self, uri_batch: List[str]) -> Iterator[Dict[str, bytes]]:
        for uri in uri_batch:
            resource_path = self.decode_uri(uri)
            resource_path = decode_path(bytes.fromhex(resource_path))
            data = self.repo.storage_engine.tree(None, resource_path, read_only=True).collect()
            if isinstance(data, BLOB):
                data = data.load()
            yield {uri: data}
