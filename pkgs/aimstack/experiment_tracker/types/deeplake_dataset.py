import deeplake
import warnings
import logging
from deeplake.util.exceptions import ReadOnlyModeError

from aim import Record

logger = logging.getLogger(__name__)


class UncommittedDatasetWarning(UserWarning):
    pass


class ViewOnUncommittedDatasetWarning(UserWarning):
    pass


class DeeplakeDataset(Record):
    """
    Track Activeloop Deeplake Dataset with versioning.

    It is generally advised to commit dataset changes before logging to runs. If dataset is a view on head of
    uncommitted changes, it's recommmended to commit dataset changes first then creating a view and loggging it.
    By default, this is ignored and results in limited traceability. Set both ``auto_commit`` and ``auto_save_view``
    to ``True`` for automatic commit or saves.
    Unsaved views created on a dataset head with changes passed to this class cannot be saved.

    :param auto_commit: If dataset head node and uncommitted dataset changes are present an auto_commit
        will trigger a dataset commit ``autocommit on aim run`` to enable reproducibility of the run,
        defaults to ``False``.

    :param auto_save_view: Triggers a save of a view if dataset is an unsaved view on a committed head
        to enable reproducibility of the run, defaults to ``False``.

    :raises TypeError: if the dataset is not a deeplake.Dataset
    :raises ValueError: if the dataset is a view and has uncommitted changes on its head but should be saved.

    .. code-block:: python

        import deeplake

        from aim._sdk.objects.plugins.deeplake_dataset import DeeplakeDataset
        from aim._sdk import Run

        # create dataset object
        ds = deeplake.dataset('hub://activeloop/cifar100-test')

        # log dataset metadata
        run = Run(system_tracking_interval=None)
        run['deeplake_ds'] = DeeplakeDataset(ds)
    """
    AIM_NAME = 'deeplake.Dataset'

    def __init__(self, dataset: deeplake.Dataset, auto_commit: bool = False, auto_save_view: bool = False):
        super().__init__()

        if not isinstance(dataset, deeplake.Dataset):
            raise TypeError("dataset must be of type ``deeplake.Dataset``")

        if dataset.has_head_changes:
            if dataset.is_view:
                if any((auto_commit, auto_save_view)):
                    raise ValueError(
                        "Dataset is a view on head of uncommitted changes. "
                        "Commit dataset changes before creating a view. "
                        "To ignore with limited traceability set both"
                        "``auto_commit`` and ``auto_save_view`` to ``False``."
                    )
                else:
                    warnings.warn(
                        "There is little to trace back data to this run. "
                        "Dataset is a view on a head of uncommitted changes. "
                        "Consider committing dataset changes before creating a view and logging runs "
                        "to enable traceability.",
                        ViewOnUncommittedDatasetWarning,
                        stacklevel=2,
                    )
            else:
                if not auto_commit:
                    warnings.warn(
                        f"Deeplake Dataset {dataset.path} has uncommitted head changes. "
                        "Consider committing dataset changes before logging runs to enable full traceability.",
                        UncommittedDatasetWarning,
                        stacklevel=2,
                    )

        self.view_info = None

        if dataset.is_view:
            if auto_save_view and not dataset.has_head_changes:
                self.view_info = dataset._get_view_info()
                view_id = self.view_info.get('id', None)
                try:
                    vds_path = dataset.save_view(message="autosave on aim run.", id=view_id, optimize=False)
                except (NotImplementedError, ReadOnlyModeError) as e:
                    # views of in-memory datasets and read-only datasets cannot be saved. but keep the view id.
                    logger.info(f'autosave view on run: {str(e)} for dataset {dataset.path}.')
                else:
                    logger.info(f'autosave view on run: dataset {dataset.path} with id {view_id} saved to {vds_path}.')
        else:
            if auto_commit and dataset.has_head_changes:
                commit_id = dataset.commit(message="autocommit on aim run")
                logger.info(f'autocommit on run: dataset {dataset.path} with commit id {commit_id}.')

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
            "pending_commit_id": ds.pending_commit_id if ds.has_head_changes else None,
            "info": dict(ds.info),  # Info might contain keys such as "description" and "title"
            "num_samples": ds.num_samples,
            "max_len": ds.max_len,
            "min_len": ds.min_len,
            "is_view": ds.is_view,
            "view_info": self.view_info,
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
