import urllib.parse

from aim.ext.external_storage.base import ExternalStorage, StorageTypeCheck, DataNotFoundError


class S3Storage(ExternalStorage):
    def __init__(self, url):
        super().__init__(url)
        parsed_uri = urllib.parse.urlparse(url)
        assert parsed_uri.scheme == 's3'
        self._bucket_name = parsed_uri.netloc
        path = parsed_uri.path
        if path.startswith('/'):
            path = path[1:]
        if path.endswith('/'):
            path = path[:-1]
        self._prefix = path

    def _put_bytes(self, path: str, data: bytes):
        s3_client = self._get_client()
        path = '/'.join((self._prefix, path))
        s3_client.put_object(Body=data, Bucket=self._bucket_name, Key=path)

    def _put_str(self, path: str, data: str):
        s3_client = self._get_client()
        path = '/'.join((self._prefix, path))
        s3_client.put_object(Body=data, Bucket=self._bucket_name, Key=path)

    def put_file(self, path: str, file: str):
        s3_client = self._get_client()
        path = '/'.join((self._prefix, path))
        s3_client.upload_file(Filename=file, Bucket=self._bucket_name, Key=path)

    def get(self, path: str) -> bytes:
        error_cls = self._botocore_exception_cls()
        try:
            s3_client = self._get_client()
            path = '/'.join((self._prefix, path)) if self._prefix else path
            response = s3_client.get_object(Bucket=self._bucket_name, Key=path)
            return response['Body'].read()
        except error_cls as e:
            raise DataNotFoundError(e)

    def get_str(self, path: str) -> str:
        error_cls = self._botocore_exception_cls()
        try:
            s3_client = self._get_client()
            path = '/'.join((self._prefix, path)) if self._prefix else path
            response = s3_client.get_object(Bucket=self._bucket_name, Key=path)
            return response['Body'].read().decode('utf-8')
        except error_cls as e:
            raise DataNotFoundError(e)

    def get_file(self, path: str, dest_path: str):
        s3_client = self._get_client()
        path = '/'.join((self._prefix, path)) if self._prefix else path
        s3_client.download_file(Bucket=self._bucket_name, Key=path, Filename=dest_path)

    @classmethod
    def scheme(cls):
        return 's3'

    @classmethod
    def status(cls) -> StorageTypeCheck:
        try:
            import boto3  # noqa
            return StorageTypeCheck(True, [])
        except (ImportError, ModuleNotFoundError):
            return StorageTypeCheck(False, ['boto3'])

    def _botocore_exception_cls(self):
        assert self.status().exists
        from botocore.exceptions import ClientError
        return ClientError

    def _get_client(self):
        """Helper method to create boto S3 client.
        Upon user requests in the future might handle client Config and other params.
        """
        assert self.status().exists
        import boto3
        return boto3.client('s3')
