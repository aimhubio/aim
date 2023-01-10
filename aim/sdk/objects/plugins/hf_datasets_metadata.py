from datasets import DatasetDict
from aim.storage.object import CustomObject


@CustomObject.alias("hf_datasets.metadata")
class HFDatasetsData(CustomObject):
    AIM_NAME = "hf_datasets.metadata"

    def __init__(self, dataset: DatasetDict):
        super().__init__()
        self.storage["dataset"] = {
            "source": "huggingface_datasets",
            "meta": self._get_ds_meta(dataset),
        }

    def _get_ds_meta(self, dataset: DatasetDict):
        dataset_info = vars(dataset[list(dataset.keys())[0]]._info)

        return {
            "description": dataset_info["description"],
            "citation": dataset_info["citation"],
            "homepage": dataset_info["homepage"],
            "license": dataset_info["license"],
            "features": [
                {feature: str(dataset_info["features"][feature])}
                for feature in dataset_info["features"].keys()
            ],
            "post_processed": str(dataset_info["post_processed"]),
            "supervised_keys": str(dataset_info["supervised_keys"]),
            "task_templates": [
                str(template) for template in dataset_info["task_templates"]
            ],
            "builder_name": dataset_info["builder_name"],
            "config_name": dataset_info["config_name"],
            "version": str(dataset_info["version"]),
            "splits": [
                {
                    subset: {
                        "num_bytes": dataset_info["splits"][subset].num_bytes,
                        "num_examples": dataset_info["splits"][subset].num_examples,
                        "dataset_name": dataset_info["splits"][subset].dataset_name,
                    }
                }
                for subset in dataset_info["splits"]
            ],
            "download_checksums": dataset_info["download_checksums"],
            "download_size": dataset_info["download_size"],
            "post_processing_size": dataset_info["post_processing_size"],
            "dataset_size": dataset_info["dataset_size"],
            "size_in_bytes": dataset_info["size_in_bytes"],
        }
