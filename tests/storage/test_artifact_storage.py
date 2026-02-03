import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock
from unittest.mock import MagicMock, patch


class TestGCSArtifactStorage(unittest.TestCase):
    """Tests for GCS Artifact Storage backend."""

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_gcs_storage_initialization(self, mock_storage):
        """Test GCS storage is properly initialized from URL."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_storage.Client.return_value = mock_client

        storage = GCSArtifactStorage('gs://my-bucket/path/to/artifacts')

        self.assertEqual(storage._bucket_name, 'my-bucket')
        self.assertEqual(storage._prefix, 'path/to/artifacts')
        mock_storage.Client.assert_called_once()
        mock_client.bucket.assert_called_once_with('my-bucket')

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_gcs_storage_initialization_no_prefix(self, mock_storage):
        """Test GCS storage with no path prefix."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_storage.Client.return_value = mock_client

        storage = GCSArtifactStorage('gs://my-bucket/')

        self.assertEqual(storage._bucket_name, 'my-bucket')
        self.assertEqual(storage._prefix, '')

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_upload_artifact_blocking(self, mock_storage):
        """Test blocking upload of artifact to GCS."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_storage.Client.return_value = mock_client
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        storage = GCSArtifactStorage('gs://my-bucket/artifacts')

        with tempfile.NamedTemporaryFile(delete=False) as f:
            f.write(b'test content')
            temp_file = f.name

        try:
            storage.upload_artifact(temp_file, 'test/artifact.txt', block=True)

            mock_bucket.blob.assert_called_with('artifacts/test/artifact.txt')
            mock_blob.upload_from_filename.assert_called_once_with(temp_file)
        finally:
            os.unlink(temp_file)

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_upload_artifact_non_blocking(self, mock_storage):
        """Test non-blocking upload submits to thread pool."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_storage.Client.return_value = mock_client
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        storage = GCSArtifactStorage('gs://my-bucket/artifacts')

        with tempfile.NamedTemporaryFile(delete=False) as f:
            f.write(b'test content')
            temp_file = f.name

        try:
            storage.upload_artifact(temp_file, 'test/artifact.txt', block=False)
            # Wait for thread pool to complete
            storage._resources._close()

            mock_bucket.blob.assert_called_with('artifacts/test/artifact.txt')
            mock_blob.upload_from_filename.assert_called_once_with(temp_file)
        finally:
            os.unlink(temp_file)

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_download_artifact(self, mock_storage):
        """Test downloading artifact from GCS."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_storage.Client.return_value = mock_client
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        storage = GCSArtifactStorage('gs://my-bucket/artifacts')

        with tempfile.TemporaryDirectory() as dest_dir:
            result = storage.download_artifact('test/artifact.txt', dest_dir)

            mock_bucket.blob.assert_called_with('artifacts/test/artifact.txt')
            self.assertTrue(result.endswith('artifact.txt'))
            mock_blob.download_to_filename.assert_called_once()

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_download_artifact_no_dest_dir(self, mock_storage):
        """Test downloading artifact creates temp directory when dest_dir is None."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_storage.Client.return_value = mock_client
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        storage = GCSArtifactStorage('gs://my-bucket/artifacts')

        result = storage.download_artifact('test/artifact.txt')

        self.assertTrue(result.endswith('artifact.txt'))
        # Should be in a temp directory
        self.assertIn('tmp', result.lower()) is None or self.assertIn('temp', result.lower()) is None

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_delete_artifact(self, mock_storage):
        """Test deleting artifact from GCS."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_bucket = MagicMock()
        mock_blob = MagicMock()
        mock_storage.Client.return_value = mock_client
        mock_client.bucket.return_value = mock_bucket
        mock_bucket.blob.return_value = mock_blob

        storage = GCSArtifactStorage('gs://my-bucket/artifacts')
        storage.delete_artifact('test/artifact.txt')

        mock_bucket.blob.assert_called_with('artifacts/test/artifact.txt')
        mock_blob.delete.assert_called_once()

    def test_gcs_import_error(self):
        """Test proper error message when google-cloud-storage is not installed."""
        import sys

        # Save reference to the actual module if it exists
        saved_module = sys.modules.get('google.cloud.storage')
        saved_google = sys.modules.get('google')
        saved_google_cloud = sys.modules.get('google.cloud')

        # Remove the modules to simulate not being installed
        sys.modules['google.cloud.storage'] = None
        sys.modules['google.cloud'] = None
        sys.modules['google'] = None

        try:
            # Need to reimport the module to trigger the ImportError
            from aim.storage.artifacts import gcs_storage
            import importlib

            with self.assertRaises(ImportError) as context:
                importlib.reload(gcs_storage)
                gcs_storage.GCSArtifactStorage('gs://my-bucket/artifacts')

            self.assertIn('google-cloud-storage', str(context.exception))
            self.assertIn('pip install', str(context.exception))
        finally:
            # Restore the modules
            if saved_module is not None:
                sys.modules['google.cloud.storage'] = saved_module
            else:
                sys.modules.pop('google.cloud.storage', None)
            if saved_google_cloud is not None:
                sys.modules['google.cloud'] = saved_google_cloud
            else:
                sys.modules.pop('google.cloud', None)
            if saved_google is not None:
                sys.modules['google'] = saved_google
            else:
                sys.modules.pop('google', None)


class TestGCSArtifactStorageFactory(unittest.TestCase):
    """Tests for GCS Artifact Storage factory functions."""

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_gcs_storage_factory(self, mock_storage):
        """Test factory creates custom storage class with kwargs."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage_factory

        mock_client = MagicMock()
        mock_storage.Client.return_value = mock_client

        CustomStorage = GCSArtifactStorage_factory(project='my-project', credentials='my-creds')
        storage = CustomStorage('gs://my-bucket/artifacts')

        mock_storage.Client.assert_called_once_with(project='my-project', credentials='my-creds')

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_gcs_storage_clientconfig(self, mock_storage):
        """Test clientconfig registers custom storage in registry."""
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage_clientconfig
        from aim.storage.artifacts import registry

        mock_client = MagicMock()
        mock_storage.Client.return_value = mock_client

        # Store original
        original_gs = registry.registry.get('gs')

        try:
            GCSArtifactStorage_clientconfig(project='custom-project')

            # Verify the registry was updated
            self.assertIn('gs', registry.registry)
            self.assertNotEqual(registry.registry['gs'], original_gs)

            # Create instance and verify kwargs are passed
            custom_storage = registry.registry['gs']('gs://my-bucket/artifacts')
            mock_storage.Client.assert_called_with(project='custom-project')
        finally:
            # Restore original
            if original_gs is not None:
                registry.registry['gs'] = original_gs


class TestS3ArtifactStorage(unittest.TestCase):
    """Tests for S3 Artifact Storage backend."""

    @patch('boto3.client')
    def test_s3_storage_initialization(self, mock_boto3_client):
        """Test S3 storage is properly initialized from URL."""
        from aim.storage.artifacts.s3_storage import S3ArtifactStorage

        mock_client = MagicMock()
        mock_boto3_client.return_value = mock_client

        storage = S3ArtifactStorage('s3://my-bucket/path/to/artifacts')

        self.assertEqual(storage._bucket, 'my-bucket')
        self.assertEqual(storage._prefix, 'path/to/artifacts')
        mock_boto3_client.assert_called_once_with('s3')

    @patch('boto3.client')
    def test_upload_artifact_blocking(self, mock_boto3_client):
        """Test blocking upload of artifact to S3."""
        from aim.storage.artifacts.s3_storage import S3ArtifactStorage

        mock_client = MagicMock()
        mock_boto3_client.return_value = mock_client

        storage = S3ArtifactStorage('s3://my-bucket/artifacts')

        with tempfile.NamedTemporaryFile(delete=False) as f:
            f.write(b'test content')
            temp_file = f.name

        try:
            storage.upload_artifact(temp_file, 'test/artifact.txt', block=True)

            mock_client.upload_file.assert_called_once_with(
                Filename=temp_file, Bucket='my-bucket', Key='artifacts/test/artifact.txt'
            )
        finally:
            os.unlink(temp_file)

    @patch('boto3.client')
    def test_download_artifact(self, mock_boto3_client):
        """Test downloading artifact from S3."""
        from aim.storage.artifacts.s3_storage import S3ArtifactStorage

        mock_client = MagicMock()
        mock_boto3_client.return_value = mock_client

        storage = S3ArtifactStorage('s3://my-bucket/artifacts')

        with tempfile.TemporaryDirectory() as dest_dir:
            result = storage.download_artifact('test/artifact.txt', dest_dir)

            self.assertTrue(result.endswith('artifact.txt'))
            mock_client.download_file.assert_called_once()

    @patch('boto3.client')
    def test_delete_artifact(self, mock_boto3_client):
        """Test deleting artifact from S3."""
        from aim.storage.artifacts.s3_storage import S3ArtifactStorage

        mock_client = MagicMock()
        mock_boto3_client.return_value = mock_client

        storage = S3ArtifactStorage('s3://my-bucket/artifacts')
        storage.delete_artifact('test/artifact.txt')

        mock_client.delete_object.assert_called_once_with(Bucket='my-bucket', Key='artifacts/test/artifact.txt')


class TestFilesystemArtifactStorage(unittest.TestCase):
    """Tests for Filesystem Artifact Storage backend."""

    def test_filesystem_storage_initialization(self):
        """Test filesystem storage is properly initialized from URL."""
        from aim.storage.artifacts.filesystem_storage import FilesystemArtifactStorage

        storage = FilesystemArtifactStorage('file:///tmp/artifacts')

        self.assertEqual(storage._prefix, '/tmp/artifacts')

    def test_upload_artifact(self):
        """Test uploading artifact to filesystem."""
        from aim.storage.artifacts.filesystem_storage import FilesystemArtifactStorage

        with tempfile.TemporaryDirectory() as storage_dir:
            storage = FilesystemArtifactStorage(f'file://{storage_dir}')

            with tempfile.NamedTemporaryFile(delete=False) as f:
                f.write(b'test content')
                temp_file = f.name

            try:
                storage.upload_artifact(temp_file, 'test/artifact.txt')

                dest_path = Path(storage_dir) / 'test' / 'artifact.txt'
                self.assertTrue(dest_path.exists())
                self.assertEqual(dest_path.read_bytes(), b'test content')
            finally:
                os.unlink(temp_file)

    def test_download_artifact(self):
        """Test downloading artifact from filesystem."""
        from aim.storage.artifacts.filesystem_storage import FilesystemArtifactStorage

        with tempfile.TemporaryDirectory() as storage_dir:
            storage = FilesystemArtifactStorage(f'file://{storage_dir}')

            # Create artifact in storage
            artifact_dir = Path(storage_dir) / 'test'
            artifact_dir.mkdir(parents=True)
            artifact_path = artifact_dir / 'artifact.txt'
            artifact_path.write_bytes(b'test content')

            with tempfile.TemporaryDirectory() as dest_dir:
                result = storage.download_artifact('test/artifact.txt', dest_dir)

                self.assertTrue(result.endswith('artifact.txt'))
                self.assertEqual(Path(result).read_bytes(), b'test content')

    def test_delete_artifact(self):
        """Test deleting artifact from filesystem."""
        from aim.storage.artifacts.filesystem_storage import FilesystemArtifactStorage

        with tempfile.TemporaryDirectory() as storage_dir:
            storage = FilesystemArtifactStorage(f'file://{storage_dir}')

            # Create artifact in storage
            artifact_dir = Path(storage_dir) / 'test'
            artifact_dir.mkdir(parents=True)
            artifact_path = artifact_dir / 'artifact.txt'
            artifact_path.write_bytes(b'test content')

            storage.delete_artifact('test')

            self.assertFalse(artifact_dir.exists())


class TestArtifactStorageRegistry(unittest.TestCase):
    """Tests for Artifact Storage Registry."""

    def test_registry_has_expected_backends(self):
        """Test registry contains all expected storage backends."""
        from aim.storage.artifacts import registry

        self.assertIn('s3', registry.registry)
        self.assertIn('gs', registry.registry)
        self.assertIn('file', registry.registry)

    def test_get_storage_s3(self):
        """Test getting S3 storage from registry."""
        from aim.storage.artifacts import registry
        from aim.storage.artifacts.s3_storage import S3ArtifactStorage

        with patch('boto3.client'):
            storage = registry.get_storage('s3://my-bucket/artifacts')
            self.assertIsInstance(storage, S3ArtifactStorage)

    @patch('aim.storage.artifacts.gcs_storage.storage')
    def test_get_storage_gcs(self, mock_storage):
        """Test getting GCS storage from registry."""
        from aim.storage.artifacts import registry
        from aim.storage.artifacts.gcs_storage import GCSArtifactStorage

        mock_client = MagicMock()
        mock_storage.Client.return_value = mock_client

        # Clear the LRU cache to avoid cached values
        registry.get_storage.cache_clear()

        storage = registry.get_storage('gs://my-bucket/artifacts')
        self.assertIsInstance(storage, GCSArtifactStorage)

    def test_get_storage_file(self):
        """Test getting filesystem storage from registry."""
        from aim.storage.artifacts import registry
        from aim.storage.artifacts.filesystem_storage import FilesystemArtifactStorage

        # Clear the LRU cache to avoid cached values
        registry.get_storage.cache_clear()

        storage = registry.get_storage('file:///tmp/artifacts')
        self.assertIsInstance(storage, FilesystemArtifactStorage)

    def test_unsupported_scheme(self):
        """Test error for unsupported storage scheme."""
        from aim.storage.artifacts import registry

        # Clear the LRU cache
        registry.get_storage.cache_clear()

        with self.assertRaises(ValueError) as context:
            registry.get_storage('unsupported://bucket/path')

        self.assertIn('unsupported', str(context.exception))
        self.assertIn('not supported', str(context.exception))


if __name__ == '__main__':
    unittest.main()
