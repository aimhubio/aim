import logging
from typing import Optional, Union, TYPE_CHECKING
import pathlib

if TYPE_CHECKING:
    from aim.sdk.repo import Repo

logger = logging.getLogger(__name__)


def get_repo(repo: Optional[Union[str, 'Repo', pathlib.Path]]) -> 'Repo':
    from aim.sdk.repo import Repo, RepoStatus

    if repo is None:
        repo = Repo.default_repo_path()
    if isinstance(repo, pathlib.Path):
        repo = str(repo)
    if isinstance(repo, str):
        repo_status = Repo.check_repo_status(repo)
        if repo_status == RepoStatus.UPDATE_REQUIRED:
            logger.error(f'Trying to open repository {repo}, which is out of date. ')
            raise RuntimeError()
        elif repo_status == RepoStatus.MISSING:
            repo = Repo.from_path(repo, init=True)
        else:
            repo = Repo.from_path(repo)
    assert isinstance(repo, Repo)

    return repo
