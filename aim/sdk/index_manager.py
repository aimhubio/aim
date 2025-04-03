import logging
import os
import queue
import threading

from pathlib import Path

import aimrocks.errors

from aim.sdk.repo import Repo
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from watchdog.observers.polling import PollingObserver


logger = logging.getLogger(__name__)


class NewChunkCreatedHandler(FileSystemEventHandler):
    def __init__(self, manager):
        self.manager = manager

    def on_created(self, event):
        if event.is_directory and Path(event.src_path).parent == self.manager.chunks_dir:
            chunk_name = os.path.basename(event.src_path)
            logger.debug(f'Detected new chunk directory: {chunk_name}')
            self.manager.monitor_chunk_directory(event.src_path)


class ChunkChangedHandler(FileSystemEventHandler):
    def __init__(self, manager):
        self.manager = manager
        self.pending_events = set()
        self.lock = threading.Lock()

    def _trigger_event(self, run_hash):
        with self.lock:
            if run_hash not in self.pending_events:
                self.pending_events.add(run_hash)
                threading.Timer(0.5, self._process_event, [run_hash]).start()

    def _process_event(self, run_hash):
        with self.lock:
            if run_hash in self.pending_events:
                self.pending_events.remove(run_hash)
                logger.debug(f'Triggering indexing for run {run_hash}')
                self.manager.add_run_to_queue(run_hash)

    def on_any_event(self, event):
        if event.is_directory:
            return

        event_path = Path(event.src_path)
        parent_dir = event_path.parent
        run_hash = parent_dir.name

        # Ensure the parent directory is directly inside meta/chunks/
        if parent_dir.parent != self.manager.chunks_dir:
            logger.debug(f'Skipping event outside valid chunk directory: {event.src_path}')
            return

        if event_path.name.startswith('LOG'):
            logger.debug(f'Skipping event for LOG-prefixed file: {event.src_path}')
            return

        logger.debug(f'Detected change in {event.src_path}')
        self._trigger_event(run_hash)


class RepoIndexManager:
    index_manager_pool = {}

    @classmethod
    def get_index_manager(cls, repo: Repo, disable_monitoring: bool = False):
        mng = cls.index_manager_pool.get(repo.path, None)
        if mng is None:
            mng = RepoIndexManager(repo, disable_monitoring)
            cls.index_manager_pool[repo.path] = mng
        return mng

    def __init__(self, repo: Repo, disable_monitoring: bool):
        self.repo_path = repo.path
        self.repo = repo
        self.chunks_dir = Path(self.repo_path) / 'meta' / 'chunks'
        self.chunks_dir.mkdir(parents=True, exist_ok=True)

        self._corrupted_runs = set()

        if not disable_monitoring:
            self.indexing_queue = queue.PriorityQueue()
            self.lock = threading.Lock()

            self.new_chunk_observer = Observer()
            self.chunk_change_observer = PollingObserver()

            self.new_chunk_handler = NewChunkCreatedHandler(self)
            self.chunk_change_handler = ChunkChangedHandler(self)

            self.new_chunk_observer.schedule(self.new_chunk_handler, self.chunks_dir, recursive=True)
            self.new_chunk_observer.start()

            self._monitor_existing_chunks()
            self.chunk_change_observer.start()

            self._reindex_thread = threading.Thread(target=self._process_queue, daemon=True)
            self._reindex_thread.start()

    def _monitor_existing_chunks(self):
        for chunk_path in self.chunks_dir.iterdir():
            if chunk_path.is_dir():
                logger.debug(f'Monitoring existing chunk: {chunk_path}')
                self.monitor_chunk_directory(chunk_path)

    def monitor_chunk_directory(self, chunk_path):
        """Ensure chunk directory is monitored using a single handler."""
        if str(chunk_path) not in self.chunk_change_observer._watches:
            self.chunk_change_observer.schedule(self.chunk_change_handler, chunk_path, recursive=True)
            logger.debug(f'Started monitoring chunk directory: {chunk_path}')
        else:
            logger.debug(f'Chunk directory already monitored: {chunk_path}')

    def add_run_to_queue(self, run_hash):
        if run_hash in self._corrupted_runs:
            return
        timestamp = os.path.getmtime(os.path.join(self.chunks_dir, run_hash))
        with self.lock:
            self.indexing_queue.put((timestamp, run_hash))
        logger.debug(f'Run {run_hash} added to indexing queue with timestamp {timestamp}')

    def _process_queue(self):
        while True:
            _, run_hash = self.indexing_queue.get()
            logger.debug(f'Indexing run {run_hash}...')
            self.index(run_hash)
            self.indexing_queue.task_done()

    def index(self, run_hash):
        index = self.repo._get_index_tree('meta', 0).view(())
        try:
            meta_tree = self.repo.request_tree(
                'meta', run_hash, read_only=True, from_union=False, no_cache=True, skip_read_optimization=True
            ).subtree('meta')
            meta_run_tree = meta_tree.subtree('chunks').subtree(run_hash)
            meta_run_tree.finalize(index=index)
        except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
            logger.warning(f"Indexing thread detected corrupted run '{run_hash}'. Skipping.")
            self._corrupted_runs.add(run_hash)
        return True
