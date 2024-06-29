from logging import getLogger

from aim.storage.object import CustomObject
from datasets import Dataset, DatasetDict


logger = getLogger(__name__)


@CustomObject.alias('hf_datasets.metadata')
class HFDataset(CustomObject):
    AIM_NAME = 'hf_datasets.metadata'
    DEFAULT_KEY = 'train'

    def __init__(self, dataset: DatasetDict):
        super().__init__()
        self.storage['dataset'] = {
            'source': 'huggingface_datasets',
            'meta': self._get_ds_meta(dataset),
        }

    def _get_ds_meta(self, dataset: DatasetDict):
        if isinstance(dataset, DatasetDict):
            try:
                dataset_info = vars(dataset[HFDataset.DEFAULT_KEY]._info)
            except KeyError:
                raise KeyError(f"Failed to get dataset key '{HFDataset.DEFAULT_KEY}'")
        elif isinstance(dataset, Dataset):
            dataset_info = vars(dataset._info)
        else:
            raise NotImplementedError(f'Failed to find dataset instance of type {type(dataset)}')
        return {
            'description': dataset_info.get('description'),
            'citation': dataset_info.get('citation'),
            'homepage': dataset_info.get('homepage'),
            'license': dataset_info.get('license'),
            'features': self._get_features(dataset_info),
            'post_processed': str(dataset_info.get('post_processed')),
            'supervised_keys': str(dataset_info.get('supervised_keys')),
            'task_templates': self._get_task_templates(dataset_info),
            'builder_name': dataset_info.get('builder_name'),
            'config_name': dataset_info.get('config_name'),
            'version': str(dataset_info.get('version')),
            'splits': self._get_splits(dataset_info),
            'download_checksums': dataset_info.get('download_checksums'),
            'download_size': dataset_info.get('download_size'),
            'post_processing_size': dataset_info.get('post_processing_size'),
            'dataset_size': dataset_info.get('dataset_size'),
            'size_in_bytes': dataset_info.get('size_in_bytes'),
        }

    def _get_features(self, dataset_info):
        try:
            if dataset_info.get('features'):
                return [
                    {feature: str(dataset_info.get('features')[feature])}
                    for feature in dataset_info.get('features').keys()
                ]
        except LookupError:
            logger.warning('Failed to get features information')

    def _get_task_templates(self, dataset_info):
        try:
            if dataset_info.get('task_templates'):
                return [str(template) for template in dataset_info.get('task_templates')]
        except LookupError:
            logger.warning('Failed to get task templates information')

    def _get_splits(self, dataset_info):
        try:
            if dataset_info.get('splits'):
                return [
                    {
                        subset: {
                            'num_bytes': dataset_info.get('splits')[subset].num_bytes,
                            'num_examples': dataset_info.get('splits')[subset].num_examples,
                            'dataset_name': dataset_info.get('splits')[subset].dataset_name,
                        }
                    }
                    for subset in dataset_info.get('splits')
                ]
        except LookupError:
            logger.warning('Failed to get splits information')
