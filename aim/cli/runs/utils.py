import fnmatch
import os

from typing import List


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
