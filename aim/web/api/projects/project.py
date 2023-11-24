import os

from aim.sdk.repo import Repo
from aim.sdk.configs import get_aim_repo_name
from aim.web.utils import get_root_path


class Project:
    def __init__(self):
        root_path = get_root_path()
        repo_path = f'{root_path}/{get_aim_repo_name()}'

        self.name = 'My awesome project'
        self.path = root_path
        self.repo_path = repo_path
        self.description = ''
        self.repo = Repo.from_path(self.repo_path)

    def cleanup_repo_pools(self):
        self.repo.container_pool.clear()
        self.repo.container_view_pool.clear()
        self.repo.persistent_pool.clear()

    def cleanup_sql_caches(self):
        for cache in self.repo.structured_db.caches.values():
            cache.empty_cache()

    def exists(self):
        """
        Checks whether .aim repository is created
        """
        return self.repo and os.path.exists(self.repo_path)
