from abc import abstractmethod
from typing import Optional


class AbstractArtifactStorage:
    def __init__(self, url: str):
        self.url = url

    @abstractmethod
    def upload_artifact(self, file_path: str, artifact_path: str, block: bool = False): ...

    @abstractmethod
    def download_artifact(self, artifact_path: str, dest_dir: Optional[str] = None) -> str: ...

    @abstractmethod
    def delete_artifact(self, artifact_path: str): ...
