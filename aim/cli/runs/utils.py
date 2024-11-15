import fnmatch
import io
import os
import zipfile

from datetime import datetime
from typing import TYPE_CHECKING, List, Tuple


if TYPE_CHECKING:
    from aim.sdk.repo import Repo


def match_runs(repo: 'Repo', hashes: List[str], lookup_dir: str = None) -> List[str]:
    matched_hashes = set()
    all_run_hashes = None
    for run_hash in hashes:
        if '*' in run_hash:
            expr = run_hash  # for the sake of readability
            # avoiding multiple or unnecessary list_runs() calls
            if not all_run_hashes:
                all_run_hashes = repo.list_all_runs()
            if expr == '*':
                return all_run_hashes
            # update the matches set with current expression matches
            matched_hashes.update(fnmatch.filter(all_run_hashes, expr))
        else:
            matched_hashes.add(run_hash)

    return list(matched_hashes)


def make_zip_archive(repo_path: str) -> io.BytesIO:
    aim_dir = os.path.join(repo_path, '.aim')
    zip_buf = io.BytesIO()
    zipf = zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED)
    len_dir_path = len(aim_dir)
    for root, _, files in os.walk(aim_dir):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, file_path[len_dir_path:])
    zipf.close()
    return zip_buf


def upload_repo_runs(buffer: io.BytesIO, bucket_name: str) -> Tuple[bool, str]:
    try:
        import boto3
    except ImportError:
        raise RuntimeError(
            "This command requires 'boto3' to be installed. " 'Please install it with command: \n pip install boto3'
        )

    try:
        s3_client = boto3.client('s3')
        buckets = s3_client.list_buckets()
        bucket_names = []
        for bucket in buckets['Buckets']:
            bucket_names.append(bucket['Name'])

        if bucket_name not in bucket_names:
            s3_client.create_bucket(Bucket=bucket_name)

        key = f'aim-{datetime.now().strftime("%Y-%m-%d-%H-%M-%S")}.zip'
        s3_client.upload_fileobj(buffer, bucket_name, key)
        return True, key
    except Exception as e:
        return False, e
