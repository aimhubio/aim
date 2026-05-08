import os
import pathlib
import shutil
import tempfile

import pytest

from aim.storage.artifacts.artifact_storage import safe_join, safe_join_posix
from aim.storage.artifacts.filesystem_storage import FilesystemArtifactStorage


class TestSafeJoin:
    def test_relative_path_is_allowed(self):
        with tempfile.TemporaryDirectory() as tmp:
            joined = safe_join(tmp, 'subdir/file.txt')
            assert pathlib.Path(joined).is_relative_to(pathlib.Path(tmp).resolve())

    def test_absolute_path_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            with pytest.raises(ValueError):
                safe_join(tmp, '/etc/passwd')

    def test_dotdot_traversal_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            with pytest.raises(ValueError):
                safe_join(tmp, '../../etc/passwd')

    def test_embedded_dotdot_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            with pytest.raises(ValueError):
                safe_join(tmp, 'foo/../../etc/passwd')

    def test_safe_join_posix_relative_ok(self):
        assert safe_join_posix('artifacts', 'sub/file.txt') == 'artifacts/sub/file.txt'

    def test_safe_join_posix_rejects_absolute(self):
        with pytest.raises(ValueError):
            safe_join_posix('artifacts', '/etc/passwd')

    def test_safe_join_posix_rejects_dotdot(self):
        with pytest.raises(ValueError):
            safe_join_posix('artifacts', '../escape.txt')


class TestFilesystemArtifactStoragePathTraversal:
    @pytest.fixture
    def workspace(self):
        root = tempfile.mkdtemp()
        artifact_root = os.path.join(root, 'artifacts')
        os.makedirs(artifact_root, exist_ok=True)

        source_file = os.path.join(root, 'payload.txt')
        with open(source_file, 'w') as fh:
            fh.write('attacker payload')

        yield {'root': root, 'artifact_root': artifact_root, 'source_file': source_file}

        shutil.rmtree(root, ignore_errors=True)

    def test_upload_rejects_absolute_artifact_path(self, workspace, tmp_path):
        storage = FilesystemArtifactStorage(f'file://{workspace["artifact_root"]}')

        outside_target = tmp_path / 'outside_pwn.txt'

        with pytest.raises(ValueError):
            storage.upload_artifact(workspace['source_file'], str(outside_target))

        assert not outside_target.exists(), 'absolute artifact_path must not write outside the artifact root'

    def test_upload_rejects_dotdot_artifact_path(self, workspace):
        storage = FilesystemArtifactStorage(f'file://{workspace["artifact_root"]}')

        with pytest.raises(ValueError):
            storage.upload_artifact(workspace['source_file'], '../outside_pwn.txt')

        outside_target = pathlib.Path(workspace['root']) / 'outside_pwn.txt'
        assert not outside_target.exists()

    def test_delete_rejects_absolute_artifact_path(self, workspace, tmp_path):
        storage = FilesystemArtifactStorage(f'file://{workspace["artifact_root"]}')

        # Create a directory we want to ensure is NOT touched.
        protected = tmp_path / 'protected'
        protected.mkdir()
        (protected / 'file').write_text('do not delete me')

        with pytest.raises(ValueError):
            storage.delete_artifact(str(protected))

        assert protected.exists()
        assert (protected / 'file').exists()

    def test_upload_relative_path_still_works(self, workspace):
        storage = FilesystemArtifactStorage(f'file://{workspace["artifact_root"]}')

        storage.upload_artifact(workspace['source_file'], 'sub/dir/legit.txt')

        landed = pathlib.Path(workspace['artifact_root']) / 'sub' / 'dir' / 'legit.txt'
        assert landed.is_file()
        assert landed.read_text() == 'attacker payload'
