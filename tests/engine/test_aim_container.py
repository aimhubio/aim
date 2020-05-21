from aim.engine.aim_container import * 
import unittest

TEST_REPO_NAME = "test"

class TestAimContainer(unittest.TestCase):
    def test_container(self):
        """
        Test container can be mounted correctly.
        """
        # Init test container
        # ac = AimContainer(TEST_REPO_NAME)
        # repo should be the class repo.
        # acID = ac.up()
        # self.assertNotEqual(acID, None, "Error when container mounted in background.")
        # Get container again and check id
        # self.assertEqual(acID, ac.get_container(), "Inconsistent Container ID")

if __name__ == '__main__':
    unittest.main()



