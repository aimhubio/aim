import logging
import pathlib

from typing import TYPE_CHECKING, Dict, Optional, Union

from aim.sdk.errors import MissingRunError
from aim.sdk.repo_utils import get_repo
from aim.sdk.tracker import STEP_HASH_FUNCTIONS
from aim.sdk.utils import generate_run_hash
from aim.storage.hashing import hash_auto
from aim.storage.treeview import TreeView


if TYPE_CHECKING:
    from aim.sdk.repo import Repo

logger = logging.getLogger(__name__)


class BaseRun:
    def __new__(cls, *args, **kwargs):
        # prevent BaseRun from being instantiated directly
        if cls is BaseRun:
            raise TypeError(f"Only children of '{cls.__name__}' may be instantiated.")
        return object.__new__(cls)

    def __init__(
        self,
        run_hash: Optional[str] = None,
        repo: Optional[Union[str, 'Repo', pathlib.Path]] = None,
        read_only: bool = False,
        force_resume: bool = False,
    ):
        self._hash = None
        self._lock = None

        self.read_only = read_only
        self.repo = get_repo(repo)
        if self.read_only:
            assert run_hash is not None
            self.hash = run_hash
        else:
            if run_hash is None:
                self.hash = generate_run_hash()
            elif self.repo.run_exists(run_hash):
                self.hash = run_hash
            else:
                raise MissingRunError(f'Cannot find Run {run_hash} in aim Repo {self.repo.path}.')
            self._lock = self.repo.request_run_lock(self.hash)
            self._lock.lock(force=force_resume)

        self.meta_tree: TreeView = self.repo.request_tree(
            'meta', self.hash, read_only=read_only, from_union=True
        ).subtree('meta')
        self.meta_run_tree: TreeView = self.meta_tree.subtree('chunks').subtree(self.hash)

        self._series_run_trees: Dict[int, TreeView] = None

    def __hash__(self) -> int:
        if self._hash is None:
            self._hash = self._calc_hash()
        return self._hash

    def __repr__(self) -> str:
        return f'<Run#{hash(self)} name={self.hash} repo={self.repo}>'

    @property
    def series_run_trees(self) -> Dict[int, TreeView]:
        if self._series_run_trees is None:
            series_tree = self.repo.request_tree('seqs', self.hash, read_only=self.read_only).subtree('seqs')
            self._series_run_trees = {}
            for version in STEP_HASH_FUNCTIONS.keys():
                if version == 1:
                    self._series_run_trees[version] = series_tree.subtree(('chunks', self.hash))
                else:
                    self._series_run_trees[version] = series_tree.subtree((f'v{version}', 'chunks', self.hash))
        return self._series_run_trees

    def check_metrics_version(self) -> bool:
        metric_dtypes = ('float', 'float64', 'int')
        traces_tree = self.meta_run_tree.get('traces', {})

        v1_metric_found = False
        for ctx_metadata in traces_tree.values():
            for seq_metadata in ctx_metadata.values():
                if seq_metadata.get('dtype', 'float') in metric_dtypes:
                    if seq_metadata.get('version', 1) == 1:
                        v1_metric_found = True
                        break
        return v1_metric_found

    def update_metrics(self):
        metric_dtypes = ('float', 'float64', 'int')
        series_meta_tree = self.meta_run_tree.subtree('traces')

        for ctx_id, ctx_traces in series_meta_tree.items():
            for name, trace_info in ctx_traces.items():
                if (trace_info.get('dtype', 'float') in metric_dtypes) and (trace_info.get('version', 1) == 1):
                    series = self.series_run_trees[1].subtree((ctx_id, name))
                    new_series = self.series_run_trees[2].subtree((ctx_id, name))
                    step_view = new_series.array('step', dtype='int64').allocate()
                    val_view = new_series.array('val').allocate()
                    epoch_view = new_series.array('epoch', dtype='int64').allocate()
                    time_view = new_series.array('time', dtype='int64').allocate()
                    for (step, val), (_, epoch), (_, timestamp) in zip(
                        series.subtree('val').items(), series.subtree('epoch').items(), series.subtree('time').items()
                    ):
                        step_hash = hash_auto(step)
                        step_view[step_hash] = step
                        val_view[step_hash] = val
                        epoch_view[step_hash] = epoch
                        time_view[step_hash] = timestamp
                    self.meta_run_tree['traces', ctx_id, name, 'version'] = 2
                    del self.series_run_trees[1][(ctx_id, name)]

    def _calc_hash(self) -> int:
        # TODO maybe take read_only flag into account?
        return hash_auto((self.hash, hash(self.repo)))
