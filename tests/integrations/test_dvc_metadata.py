from unittest.mock import patch

import pytest
from tests.base import TestBase
from tests.utils import is_package_installed


class TestDVCIntegration(TestBase):
    @patch('aim.sdk.objects.plugins.dvc_metadata.Repo')
    @pytest.mark.skipif(not is_package_installed('dvc'), reason="'dvc' is not installed. skipping.")
    def test_dvc_files_as_run_param(self, mRepo):
        from aim.sdk import Run
        from aim.sdk.objects.plugins.dvc_metadata import DvcData

        tracked_files = ({'path': 'test_file_1.txt'}, {'path': 'test_file_2.txt'}, {'path': 'test_file_3.txt'})
        files = [e['path'] for e in tracked_files]
        mRepo.ls.return_value = tracked_files

        run = Run(system_tracking_interval=None)
        run['dvc'] = DvcData()

        # get dataset metadata
        dvc_object = run['dvc']
        dvc_dict = run.get('dvc', resolve_objects=True)

        self.assertTrue(isinstance(dvc_object, DvcData))
        self.assertTrue(isinstance(dvc_dict, dict))
        self.assertEqual('dvc', dvc_dict['dataset']['source'])
        self.assertEqual(files, dvc_dict['dataset']['tracked_files'])
