from aim.version_control.base import Base
import os

from git import Repo


class GitAdapter(Base):
    def commit(self):
        ...

    def checkout(self):
        ...

    def get_diff(self):
        repo = Repo(os.environ['PWD'], search_parent_directories=True)
        h_commit = repo.head.commit
        diff = h_commit.diff('HEAD~1', create_patch=True)
        change_types = ('A', 'C', 'D', 'R', 'M', 'T')

        for change_type in change_types:
            for diff_item in diff.iter_change_type(change_type):
                print(change_type, diff_item)
