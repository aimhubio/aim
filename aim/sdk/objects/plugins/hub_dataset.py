from aim.storage.object import CustomObject
import hub


@CustomObject.alias('hub.dataset')
class HubDataset(CustomObject):
    AIM_NAME = 'hub.dataset'

    def __init__(self, dataset: hub.Dataset):
        super().__init__()
        self.storage['dataset'] = {
            'source': 'hub',
            'meta': self._get_ds_meta(dataset)
        }

    def _get_ds_meta(self, ds: hub.Dataset):
        return {
            "path": ds.path,
            "version": ds.meta.version,
            "info": ds.info._info,  # Info might contain keys such as "description" and "title"
            "tensors": {k: self._tensor_meta(v) for k, v in ds.tensors.items()},
            "num_samples": len(ds),
        }

    def _tensor_meta(self, tensor: hub.Tensor):
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
            "info": tensor.info._info,
        }
