import unittest
import tempfile
import os

from aim.engine.repo import AimRepo


class TestAimRunArchivation(unittest.TestCase):
    def test_run_archivation(self):
        """
        Test aim repo can be removed correctly.
        """
        prefix = os.getcwd() + '/'
        with tempfile.TemporaryDirectory(prefix=prefix) as tmp_dir_path:
            AimRepo(tmp_dir_path).init()

            experiment = 'test'
            run_hash = AimRepo.generate_commit_hash()
            repo = AimRepo(tmp_dir_path, experiment, run_hash)
            repo.commit_init()
            repo.commit_finish()

            self.assertFalse(repo.is_archived(experiment, run_hash))

            repo.archive(experiment, run_hash)
            self.assertTrue(repo.is_archived(experiment, run_hash))

            repo.unarchive(experiment, run_hash)
            self.assertFalse(repo.is_archived(experiment, run_hash))


if __name__ == '__main__':
    unittest.main()
