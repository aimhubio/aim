import pytest
from tests.base import TestBase
from tests.utils import is_package_installed


class TestDeeplakeDatasetIntegration(TestBase):
    @pytest.mark.skipif(not is_package_installed('deeplake'), reason="'deeplake' is not installed. skipping.")
    def test_dataset_as_run_param(self):
        import deeplake

        from aim.sdk import Run
        from aim.sdk.objects.plugins.deeplake_dataset import DeeplakeDataset

        # create dataset object
        ds = deeplake.dataset('hub://activeloop/cifar100-test')

        # log dataset metadata
        run = Run(system_tracking_interval=None)
        run['deeplake_ds'] = DeeplakeDataset(ds)

        # get dataset metadata
        ds_object = run['deeplake_ds']
        ds_dict = run.get('deeplake_ds', resolve_objects=True)

        self.assertTrue(isinstance(ds_object, DeeplakeDataset))
        self.assertTrue(isinstance(ds_dict, dict))
        self.assertIn('meta', ds_dict['dataset'].keys())
        self.assertIn('source', ds_dict['dataset'].keys())
