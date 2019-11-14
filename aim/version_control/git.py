from aim.version_control.base import Base
import os

from git import Repo


class GitAdapter(Base):
    @staticmethod
    def get_repo():
        return Repo(os.environ['PWD'], search_parent_directories=True)

    def get_untracked_files(self) -> list:
        """
        Returns a list containing all untracked files
        """
        repo = self.get_repo()
        git = repo.git

        untracked_files = git.ls_files('--others', '--exclude-standard').strip()

        if not untracked_files:
            return []

        return untracked_files.split('\n')

    def commit_changes_to_branch(self, commit_msg,
                                 branch_name, branch_prefix='aim/'):
        """
        Commits changes to a new created branch and returns branch name
        """
        branch = '{}{}'.format(branch_prefix, branch_name)

        try:
            repo = self.get_repo()
            git = repo.git
            active_branch_name = repo.active_branch.name

            # Stash changes
            git.stash('save')

            # Checkout new branch
            git.checkout('HEAD', b=branch)

            # Apply the last stash
            git.stash('apply')

            # Commit changes
            repo.index.commit(commit_msg)

            # Checkout to previous branch
            git.checkout(active_branch_name)

            # Apply and remove the last stash
            git.stash('pop')
        except:
            raise Exception('failed to commit changes to {branch}, ' +
                            'find your uncommitted changes in stash list ' +
                            'to recover git index state manually' +
                            ''.format(branch=branch))

        return branch

    def get_diff(self):
        repo = Repo(os.environ['PWD'], search_parent_directories=True)
        h_commit = repo.head.commit
        diff = h_commit.diff('HEAD~1', create_patch=True)
        change_types = ('A', 'C', 'D', 'R', 'M', 'T')

        for change_type in change_types:
            for diff_item in diff.iter_change_type(change_type):
                print(change_type, diff_item)
