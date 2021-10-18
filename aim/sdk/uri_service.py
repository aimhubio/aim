from cryptography.fernet import Fernet
from typing import Tuple, List, Optional
from typing import TYPE_CHECKING


from aim.storage.encoding import encode_path, decode_path
from aim.sdk.repo import ContainerConfig
if TYPE_CHECKING:
    from aim.storage.types import AimObjectPath
    from aim.storage.prefixview import PrefixView
    from aim.sdk.repo import Repo

ENCRYPTION_KEY = 'rirkE_IqQUTneodrNe_fZo8mNUkGVE9jR19QiElzpjc='  # subject to change
SEPARATOR = '__'  # subject to change


def generate_resource_path(prefix_view: 'PrefixView', additional_path: 'AimObjectPath') -> str:
    prefix_path = decode_path(prefix_view.prefix)
    encoded_path = encode_path((*prefix_path, *additional_path))
    return encoded_path.hex()


class URIService:
    def __init__(self, repo: 'Repo'):
        self.repo = repo
        self.container_persistent_pool = dict()

    @classmethod
    def generate_uri(cls, run_name: str, sub_name: str = None, resource_path: str = None) -> str:
        encryptor = Fernet(key=ENCRYPTION_KEY)
        to_be_encrypted = f'{run_name}{SEPARATOR}{sub_name}{SEPARATOR}{resource_path}'
        return encryptor.encrypt(to_be_encrypted.encode()).decode()

    def request_batch(self, uri_batch: List[str]):
        for uri in uri_batch:
            run_name, sub_name, resource_path = self.decode_uri(uri)
            resource_path = decode_path(bytes.fromhex(resource_path))
            config = ContainerConfig(run_name, sub_name, read_only=True)
            container = self.container_persistent_pool.get(config)
            if not container:
                if sub_name == 'meta':
                    container = self.repo.request(sub_name, run_name, from_union=True, read_only=True)
                else:
                    container = self.repo.request(sub_name, run_name, read_only=True)

                self.container_persistent_pool[config] = container
            yield container.tree().view(resource_path).collect()

        # clear container pool
        self.container_persistent_pool.clear()

    @classmethod
    def decode_uri(cls, uri: str) -> List[Optional[str]]:
        decryptor = Fernet(key=ENCRYPTION_KEY)
        decrypted_uri = decryptor.decrypt(uri.encode()).decode()
        result = decrypted_uri.split(SEPARATOR, maxsplit=2)
        assert len(result) <= 3
        # extend result length to 3, fill with [None]s
        result.extend([None]*(3-len(result)))

        return result
