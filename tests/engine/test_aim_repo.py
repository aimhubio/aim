from aim.engine.aim_repo import * 
from aim.engine.configs import * 
import unittest
import tempfile
import os


class TestAimRepo(unittest.TestCase):
    @staticmethod
    def get_aim_repo(directory):
        """
        Searches for .aim repository in the givne directory
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
        prefix = os.getcwd() + "/"
        with tempfile.TemporaryDirectory(prefix=prefix) as tmpdirname:
            ar = AimRepo(tmpdirname)
            ar.init()
            # repo should be found in the current temporary folder.
            self.assertNotEqual(TestAimRepo.get_aim_repo(tmpdirname), None, "AimRepo not created successfully.")
            self.assertTrue(ar.exists())
            # Examine config & branch
            self.assertEqual(ar.config.get('active_branch'), AIM_DEFAULT_BRANCH_NAME)
            self.assertEqual(len(ar.config.get('branches')), 1)

    def test_remove_repo(self):
        """
        Test aim repo can be removed correctly.
        """
        prefix = os.getcwd() + "/"
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
        prefix = os.getcwd() + "/"
        branch_name = "test"
        with tempfile.TemporaryDirectory(prefix=prefix) as tmpdirname:
            ar = AimRepo(tmpdirname)
            ar.init()
            # create branch "test"
            ar.create_branch(branch_name)
            self.assertEqual(ar.config.get('active_branch'), AIM_DEFAULT_BRANCH_NAME)
            branches = ar.config.get('branches')
            self.assertEqual(len(branches), 2)
            is_found = False
            for b in branches:
                if b.get('name') == branch_name:
                    is_found = True
            self.assertTrue(is_found)
            # checkout branch "test"
            ar.checkout_branch(branch_name)
            self.assertEqual(ar.config.get('active_branch'), branch_name)
            # remove branch "test"
            ar.remove_branch(branch_name)
            branches = ar.config.get('branches')
            self.assertEqual(len(branches), 1)
            # checkout branch "test" again
            self.assertRaises(AttributeError, ar.checkout_branch, branch_name)
            # remove branch "test" again
            self.assertRaises(AttributeError, ar.remove_branch, branch_name)
    
    def test_commits(self):
        """
        Test commit operations.
        Init => store test file => commit in default branch 
        => checkout "test" branch => store another test file => commit
        """
        prefix = os.getcwd() + "/"
        branch_name = "test"
        with tempfile.TemporaryDirectory(prefix=prefix) as tmpdirname:
            ar = AimRepo(tmpdirname)
            ar.init()
            # store a random test file used to commit
            ar.store_file("test file one", "test file one", )
            # commit in master branch
            result = ar.commit("1", "test commit message first")
            self.assertEqual(result, {
                'branch': "default",
                'commit': "1"
            })
            ar.create_branch(branch_name)
            ar.checkout_branch(branch_name)
            result_two = ar.commit("2", "test commit message second")
            self.assertEqual(result_two, {
                'branch': 'test',
                'commit': '2'
            })



if __name__ == '__main__':
    unittest.main()



