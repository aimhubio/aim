import fnmatch
import os

from typing import List

from aim.sdk.configs import get_aim_repo_name

aim_repo_name = get_aim_repo_name()


def list_repo_runs(repo_path: str) -> List[str]:
    if repo_path.endswith(aim_repo_name):
        chunks_dir = os.path.join(repo_path, 'meta', 'chunks')
    else:
        chunks_dir = os.path.join(repo_path, aim_repo_name, 'meta', 'chunks')
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
