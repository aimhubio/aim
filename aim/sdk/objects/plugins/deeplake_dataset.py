from aim.storage.object import CustomObject
import deeplake
import warnings


class UncommittedDatasetWarning(UserWarning):
    pass


@CustomObject.alias('deeplake.dataset')
class DeeplakeDataset(CustomObject):
    """
    Track Activeloop Deeplake Dataset with versioning.

    .. code-block:: python

        import deeplake

        from aim.sdk.objects.plugins.deeplake_dataset import DeeplakeDataset
        from aim.sdk import Run

        # create dataset object
        ds = deeplake.dataset('hub://activeloop/cifar100-test')

        # log dataset metadata
        run = Run(system_tracking_interval=None)
        run['deeplake_ds'] = DeeplakeDataset(ds)
    """
    AIM_NAME = 'deeplake.dataset'

    def __init__(self, dataset: deeplake.Dataset):
        super().__init__()
        if dataset.commit_id is None and dataset.has_head_changes:
            warnings.warn(
                f"Deeplake Dataset {dataset.path} has head changes but no commit yet."
                "Consider committing dataset changes before logging runs to enable full traceability.",
                UncommittedDatasetWarning,
                stacklevel=2,
            )
        self.storage['dataset'] = {
            'source': 'deeplake',
            'meta': self._get_ds_meta(dataset)
        }

    def _get_ds_meta(self, ds: deeplake.Dataset):
        return {
            "path": ds.path,
            "commit_id": ds.commit_id,
            "branch": ds.branch,
            "has_head_changes": ds.has_head_changes,
            "info": dict(ds.info),  # Info might contain keys such as "description" and "title"
            "num_samples": len(ds),
            "tensors": {group: self._tensor_meta(tensor) for group, tensor in ds.tensors.items()},
            "size_approx": ds.size_approx(),
            "deeplake_version": ds.meta.version
        }

    def _tensor_meta(self, tensor: deeplake.Tensor):
        meta = tensor.meta
        return {
            "name": tensor.key,
            "num_samples": len(tensor),
            "htype": tensor.htype,
            "dtype": str(tensor.dtype) if tensor.dtype else None,
            "compression_type": "sample_compression"
            if meta.sample_compression
            else ("chunk_compression" if meta.chunk_compression else None),
            "compression_format": meta.sample_compression or meta.chunk_compression,
            "info": dict(tensor.info),
        }
