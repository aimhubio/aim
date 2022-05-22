import fnmatch
import os

from typing import List, Tuple
import io
import zipfile
import boto3
from datetime import datetime


def list_repo_runs(repo_path: str) -> List[str]:
    chunks_dir = os.path.join(repo_path, '.aim', 'meta', 'chunks')
    return os.listdir(chunks_dir)


def match_runs(repo_path: str, hashes: List[str]) -> List[str]:
    matched_hashes = set()
    all_run_hashes = None
    for run_hash in hashes:
        if '*' in run_hash:
            expr = run_hash  # for the sake of readability
            # avoiding multiple or unnecessary list_runs() calls
            if not all_run_hashes:
                all_run_hashes = list_repo_runs(repo_path)
            if expr == '*':
                return all_run_hashes
            # update the matches set with current expression matches
            matched_hashes.update(fnmatch.filter(all_run_hashes, expr))
        else:
            matched_hashes.add(run_hash)

    return list(matched_hashes)



def make_zip_archive(repo_path: str) -> io.BytesIO:
    chunks_dir = os.path.join(repo_path, '.aim', 'meta', 'chunks')
    zip_buf = io.BytesIO()
    zipf = zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED)
    len_dir_path = len(chunks_dir)
    for root, _, files in os.walk(chunks_dir):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, file_path[len_dir_path:])
    zipf.close()
    return zip_buf


def upload_repo_runs(buffer: io.BytesIO, bucket_name: str)->Tuple[bool, str]:
    try:
        s3_client = boto3.client('s3')
        buckets = s3_client.list_buckets()
        bucket_names = []
        for bucket in buckets['Buckets']:
            bucket_names.append(bucket["Name"])
        if bucket_name not in bucket_names:
            bucket = s3_client.create_bucket(Bucket=bucket_name)
        else:
            bucket = next((bucket for bucket in buckets['Buckets'] if bucket['Name'] == bucket_name), None)
        now = datetime.now()
        key = 'aim-{year}-{month}-{date}-{hour}-{minute}-{second}.zip'.format(
            year=now.year,
            month=now.month,
            date=now.day,
            hour=now.hour,
            minute=now.minute,
            second=now.second,
        )
        s3_client.upload_fileobj(buffer, bucket_name, key)
        return True, key
    except Exception as e:
        return False, e