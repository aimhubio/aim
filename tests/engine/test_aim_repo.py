from aim.engine.repo import *
from aim.engine.configs import *
import unittest
import tempfile
import os


class TestAimRepo(unittest.TestCase):
    @staticmethod
    def get_aim_repo(directory):
        """
        Searches for .aim repository in the given directory
        and returns AimRepo object if exists
        """
        # Try to find closest .aim repository
        repo_found = False
        while True:
            if len(directory) <= 1:
                break

            if os.path.exists(os.path.join(directory, AIM_REPO_NAME)):
                repo_found = True
                break
            else:
                directory = os.path.split(directory)[0]

        if not repo_found:
            return None

        return AimRepo(directory)

    def test_create_repo(self):
        """
        Test aim repo can be created correctly.
        """
        prefix = os.getcwd() + '/'
        with tempfile.TemporaryDirectory(prefix=prefix) as tmpdirname:
            ar = AimRepo(tmpdirname)
            ar.init()
            # repo should be found in the current temporary folder.
            self.assertNotEqual(TestAimRepo.get_aim_repo(
                tmpdirname), None, 'AimRepo not created successfully.')
            self.assertTrue(ar.exists())
            # Examine config & branch
            self.assertEqual(ar.config.get('active_branch'),
                             AIM_DEFAULT_BRANCH_NAME)
            self.assertEqual(len(ar.config.get('branches')), 1)

    def test_remove_repo(self):
        """
        Test aim repo can be removed correctly.
        """
        prefix = os.getcwd() + '/'
        with tempfile.TemporaryDirectory(prefix=prefix) as tmpdirname:
            ar = AimRepo(tmpdirname)
            ar.init()
            ar.rm()
            # Test whether removed successfully
            self.assertFalse(ar.exists(), False)

    def test_branch_operations(self):
        """
        Test branch operations.
        Init => Create branch test => checkout test => remove test
        => checkout test again => remove test again
        """
        prefix = os.getcwd() + '/'
        branch_name = 'test'
        with tempfile.TemporaryDirectory(prefix=prefix) as tmpdirname:
            ar = AimRepo(tmpdirname)
            ar.init()
            # create branch 'test'
            ar.create_branch(branch_name)
            self.assertEqual(ar.config.get('active_branch'),
                             AIM_DEFAULT_BRANCH_NAME)
            branches = ar.config.get('branches')
            self.assertEqual(len(branches), 2)
            is_found = False
            for b in branches:
                if b.get('name') == branch_name:
                    is_found = True
            self.assertTrue(is_found)
            # checkout branch 'test'
            ar.checkout_branch(branch_name)
            self.assertEqual(ar.config.get('active_branch'), branch_name)
            # remove branch 'test'
            ar.remove_branch(branch_name)
            branches = ar.config.get('branches')
            self.assertEqual(len(branches), 1)
            # checkout branch 'test' again
            self.assertRaises(AttributeError, ar.checkout_branch, branch_name)
            # remove branch 'test' again
            self.assertRaises(AttributeError, ar.remove_branch, branch_name)

    def test_commits(self):
        """
        Test commit operations.
        Init => store test file => commit in default branch
        => checkout 'test' branch => store another test file => commit
        """
        prefix = os.getcwd() + '/'
        branch_name = 'test'
        with tempfile.TemporaryDirectory(prefix=prefix) as tmpdirname:
            ar = AimRepo(tmpdirname)
            ar.init()
            # store a random test file used to commit
            test_file_one_path = os.path.join(
                ar.index_path, 'test_file_one.txt')
            test_file_one = open(test_file_one_path, 'w+')
            test_file_one.write('Test file one contents.')
            test_file_one.close()
            ar.store_file('test_file_one', 'test_file_one', ('text',))
            # commit in master branch
            result = ar.commit('1', 'test commit message first')
            # after the commit, there shoukd be three files (config, meta,
            # test_file_one)
            self.assertEqual(len(ar.ls_commit_files('default', '1')), 3)
            self.assertEqual(result, {
                'branch': 'default',
                'commit': '1'
            })
            # checkout to test branch
            ar.create_branch(branch_name)
            ar.checkout_branch(branch_name)
            # store random test file
            test_file_two_path = os.path.join(
                ar.index_path, 'test_file_two.txt')
            test_file_two = open(test_file_two_path, 'w+')
            test_file_two.write('Test file one contents.')
            test_file_two.close()
            # commit again in test branch
            result_two = ar.commit('2', 'test commit message second')
            self.assertEqual(result_two, {
                'branch': 'test',
                'commit': '2'
            })
            # should be two files (config, test_file_two)
            self.assertEqual(len(ar.ls_commit_files('test', '2')), 2)


if __name__ == '__main__':
    unittest.main()
