from abc import ABC, abstractmethod


class Base(ABC):
    @staticmethod
    @abstractmethod
    def get_repo():
        ...

    @abstractmethod
    def get_untracked_files(self):
        ...

    @abstractmethod
    def commit_changes_to_branch(self, commit_msg, branch_name, branch_prefix):
        ...

    @abstractmethod
    def get_diff(self):
        ...
