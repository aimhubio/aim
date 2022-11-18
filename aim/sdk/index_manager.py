import time
import datetime
import pytz
import logging
import os

from threading import Thread
from pathlib import Path

from typing import Iterable


from aim.sdk.repo import Repo
from aim.sdk.run_status_watcher import Event, GRACE_PERIOD

logger = logging.getLogger(__name__)


class RepoIndexManager:
    index_manager_pool = {}

    @classmethod
    def get_index_manager(cls, repo: Repo):
        mng = cls.index_manager_pool.get(repo.path, None)
        if mng is None:
            mng = RepoIndexManager(repo)
            cls.index_manager_pool[repo.path] = mng
        return mng

    def __init__(self, repo: Repo):
        self.repo_path = repo.path
        self.repo = repo
        self.progress_dir = Path(self.repo_path) / 'meta' / 'progress'
        self.progress_dir.mkdir(parents=True, exist_ok=True)

        self.heartbeat_dir = Path(self.repo_path) / 'check_ins'
        self.run_heartbeat_cache = {}

        self._indexing_in_progress = False
        self._reindex_thread: Thread = None

    @property
    def repo_status(self):
        if self._indexing_in_progress is True:
            return 'indexing in progress'
        if self.reindex_needed:
            return 'needs indexing'
        return 'up-to-date'

    @property
    def reindex_needed(self) -> bool:
        runs_with_progress = os.listdir(self.progress_dir)
        return len(runs_with_progress) > 0

    def start_indexing_thread(self):
        logger.info(f'Starting indexing thread for repo \'{self.repo_path}\'')
        self._reindex_thread = Thread(target=self._run_forever, daemon=True)
        self._reindex_thread.start()

    def _run_forever(self):
        idle_cycles = 0
        while True:
            self._indexing_in_progress = False
            for run_hash in self._next_stalled_run():
                logger.info(f'Found un-indexed run {run_hash}. Indexing...')
                self._indexing_in_progress = True
                idle_cycles = 0
                try:
                    self.index(run_hash)
                except Exception as e:
                    logger.warning(f'Failed to index Run \'{run_hash}\'. Error: {e}.')
                    pass

                # sleep for small interval to release index db lock in between and allow
                # other running jobs to properly finalize and index Run.
                sleep_interval = .1
                time.sleep(sleep_interval)
            if not self._indexing_in_progress:
                idle_cycles += 1
                sleep_interval = 2 * idle_cycles if idle_cycles < 5 else 10
                logger.info(f'No un-indexed runs found. Next check will run in {sleep_interval} seconds. '
                            f'Waiting for un-indexed run...')
                time.sleep(sleep_interval)

    def _runs_with_progress(self) -> Iterable[str]:
        runs_with_progress = os.listdir(self.progress_dir)
        run_hashes = sorted(runs_with_progress, key=lambda r: os.path.getmtime(os.path.join(self.progress_dir, r)))
        return run_hashes

    def _next_stalled_run(self):
        for run_hash in self._runs_with_progress():
            if self._is_run_stalled(run_hash):
                yield run_hash

    def _is_run_stalled(self, run_hash: str) -> bool:
        heartbeat_files = list(sorted(self.heartbeat_dir.glob(f'{run_hash}-*-progress-*-*'), reverse=True))
        if heartbeat_files:
            last_heartbeat = Event(heartbeat_files[0].name)
            last_recorded_heartbeat = self.run_heartbeat_cache.get(run_hash)
            if last_recorded_heartbeat is None:
                self.run_heartbeat_cache[run_hash] = last_heartbeat
            else:
                if last_heartbeat.idx > last_recorded_heartbeat.idx:
                    self.run_heartbeat_cache[run_hash] = last_heartbeat
                else:
                    time_passed = time.time() - last_recorded_heartbeat.detected_epoch_time
                    if last_recorded_heartbeat.next_event_in + GRACE_PERIOD < time_passed:
                        return True

    def run_needs_indexing(self, run_hash: str) -> bool:
        return os.path.exists(self.progress_dir / run_hash)

    def index(self, run_hash) -> bool:
        try:
            index = self.repo._get_index_tree('meta', timeout=10).view(())
            meta_tree = self.repo.request_tree('meta', run_hash, read_only=False).subtree('meta')
            meta_run_tree = meta_tree.subtree('chunks').subtree(run_hash)
            meta_run_tree.finalize(index=index)
            if meta_run_tree['end_time'] is None:
                index['meta', 'chunks', run_hash, 'end_time'] = datetime.datetime.now(pytz.utc).timestamp()
            return True
        except TimeoutError:
            logger.warning(f'Cannot index Run {run_hash}. Index is locked.')
            return False
