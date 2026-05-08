import os
import pathlib

from abc import abstractmethod
from typing import Optional


def safe_join(prefix: str, artifact_path: str) -> pathlib.Path:
    """Join ``prefix`` and ``artifact_path`` while rejecting any input that
    would escape ``prefix`` via absolute paths, drive letters, or ``..``
    traversal segments.

    ``pathlib.Path('/a') / '/etc/passwd'`` yields ``/etc/passwd`` because
    ``pathlib``'s ``/`` operator silently discards ``prefix`` when the right
    operand is absolute. Likewise, ``pathlib.Path('/a') / '../etc/passwd'``
    yields ``/a/../etc/passwd`` which the OS resolves to ``/etc/passwd``
    when the path is later passed to ``shutil.copy``/``rmtree``/etc.

    We reject both cases up front so callers can rely on the joined path
    staying inside ``prefix``.
    """
    if artifact_path is None:
        raise ValueError('artifact_path must not be None')

    candidate = pathlib.PurePosixPath(artifact_path)
    if candidate.is_absolute() or candidate.drive or candidate.root:
        raise ValueError(f'artifact_path must be relative: {artifact_path!r}')

    if any(part == '..' for part in candidate.parts):
        raise ValueError(f'artifact_path must not contain ".." segments: {artifact_path!r}')

    base = pathlib.Path(prefix).resolve()
    joined = (base / artifact_path).resolve()
    try:
        joined.relative_to(base)
    except ValueError:
        raise ValueError(f'artifact_path escapes the artifact root: {artifact_path!r}')

    # Preserve the un-resolved form so symlinks inside ``prefix`` continue to
    # work the same way as before; the ``relative_to`` check above only
    # validates that no traversal happened.
    return pathlib.Path(prefix) / artifact_path


def safe_join_posix(prefix: str, artifact_path: str) -> str:
    """Variant of :func:`safe_join` for storage backends (e.g. S3) where the
    target is a POSIX-style key string rather than a local filesystem path.

    Performs the same anti-traversal validation but does not touch the local
    filesystem (no ``resolve()`` against the real FS).
    """
    if artifact_path is None:
        raise ValueError('artifact_path must not be None')

    candidate = pathlib.PurePosixPath(artifact_path)
    if candidate.is_absolute() or candidate.drive or candidate.root:
        raise ValueError(f'artifact_path must be relative: {artifact_path!r}')

    if any(part == '..' for part in candidate.parts):
        raise ValueError(f'artifact_path must not contain ".." segments: {artifact_path!r}')

    if prefix:
        return f'{prefix.rstrip("/")}/{artifact_path}'
    return artifact_path


# os is imported for downstream backends that may need it; keep the symbol
# exported for backwards compatibility.
__all__ = ['AbstractArtifactStorage', 'safe_join', 'safe_join_posix', 'os']


class AbstractArtifactStorage:
    def __init__(self, url: str):
        self.url = url

    @abstractmethod
    def upload_artifact(self, file_path: str, artifact_path: str, block: bool = False): ...

    @abstractmethod
    def download_artifact(self, artifact_path: str, dest_dir: Optional[str] = None) -> str: ...

    @abstractmethod
    def delete_artifact(self, artifact_path: str): ...
