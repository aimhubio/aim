from typing import Optional

from aim.sdk.legacy.deprecation_warning import deprecated
from aim.sdk.repo import Repo


@deprecated
def select_metrics(search_statement: str, repo_path: Optional[str] = None):
    if repo_path is not None:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()

    if not repo:
        return None

    return repo.query_metrics(search_statement)


@deprecated
def select_runs(expression: Optional[str] = None, repo_path: Optional[str] = None):
    if repo_path is not None:
        repo = Repo.from_path(repo_path)
    else:
        repo = Repo.default_repo()

    if not repo:
        return None

    return repo.query_runs(expression)
