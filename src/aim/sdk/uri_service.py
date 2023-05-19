from cryptography.fernet import Fernet
from collections import defaultdict
from typing import Iterator, List, Optional, Dict
from typing import TYPE_CHECKING

from aim.core.storage.encoding import encode_path, decode_path
from aim.core.storage.types import BLOB

if TYPE_CHECKING:
    from aim.core.storage.types import AimObjectPath
    from aim.core.storage.prefixview import PrefixView
    from aim.sdk.repo import Repo


def generate_resource_path(prefix_view: 'PrefixView', additional_path: 'AimObjectPath') -> str:
    prefix_path = decode_path(prefix_view.prefix)
    encoded_path = encode_path((*prefix_path, *additional_path))
    return encoded_path.hex()


class URIService:
    SEPARATOR = '__'

    def __init__(self, repo: 'Repo'):
        self.repo = repo
        self.runs_pool = defaultdict(list)

    @classmethod
    def generate_uri(cls, repo: 'Repo', run_name: str, sub_name: str, resource_path: str = None) -> str:
        encryptor = Fernet(key=repo.encryption_key)
        to_be_encrypted = f'{run_name}{URIService.SEPARATOR}{sub_name}'
        if resource_path:
            to_be_encrypted = f'{to_be_encrypted}{URIService.SEPARATOR}{resource_path}'
        print(resource_path)
        return encryptor.encrypt(to_be_encrypted.encode()).decode()

    @classmethod
    def decode_uri(cls, repo: 'Repo', uri: str) -> List[Optional[str]]:
        decryptor = Fernet(key=repo.encryption_key)
        decrypted_uri = decryptor.decrypt(uri.encode()).decode()
        result = decrypted_uri.split(URIService.SEPARATOR, maxsplit=2)
        assert len(result) <= 3
        # extend result length to 3, fill with [None]s
        result.extend([None] * (3 - len(result)))

        return result

    def request_batch(self, uri_batch: List[str]) -> Iterator[Dict[str, bytes]]:
        for uri in uri_batch:
            run_name, sub_name, resource_path = self.decode_uri(self.repo, uri)
            self.runs_pool[run_name].append((uri, sub_name, resource_path))

        for run_name in self.runs_pool.keys():
            for uri, sub_name, resource_path in self.runs_pool[run_name]:
                container_tree = self.repo._get_index_tree('meta', read_only=True)
                resource_path = decode_path(bytes.fromhex(resource_path))
                data = container_tree.subtree(resource_path).collect()
                if isinstance(data, BLOB):
                    data = data.load()
                yield {uri: data}

        # clear runs pool
        self.runs_pool.clear()
