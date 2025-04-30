import hashlib
import logging
import os
import queue
import threading
import time

from pathlib import Path
from typing import Dict

import aimrocks.errors

from aim.sdk.repo import Repo
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer
from watchdog.observers.api import ObservedWatch
from watchdog.observers.polling import PollingObserver


logger = logging.getLogger(__name__)


class NewChunkCreatedHandler(FileSystemEventHandler):
    def __init__(self, manager):
        self.manager = manager
        self.known_chunks = set(p.name for p in self.manager.chunks_dir.iterdir() if p.is_dir())

    def on_modified(self, event):
        if event.is_directory and Path(event.src_path) == self.manager.chunks_dir:
            current_chunks = set(p.name for p in self.manager.chunks_dir.iterdir() if p.is_dir())
            new_chunks = current_chunks - self.known_chunks
            for chunk_name in new_chunks:
                chunk_path = self.manager.chunks_dir / chunk_name
                logger.debug(f'Detected new chunk directory: {chunk_name}')
                self.manager.monitor_chunk_directory(chunk_path)
            self.known_chunks = current_chunks


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
    def get_index_manager(cls, repo: Repo):
        mng = cls.index_manager_pool.get(repo.path, None)
        if mng is None:
            mng = RepoIndexManager(repo)
            cls.index_manager_pool[repo.path] = mng
        return mng

    def __init__(self, repo: Repo):
        self.repo_path = repo.path
        self.repo = repo
        self.chunks_dir = Path(self.repo_path) / 'meta' / 'chunks'
        self.chunks_dir.mkdir(parents=True, exist_ok=True)

        self._corrupted_runs = set()

        self.indexing_queue = queue.PriorityQueue()
        self.lock = threading.Lock()

        self.new_chunk_observer = Observer()
        self.chunk_change_observer = PollingObserver()

        self.new_chunk_handler = NewChunkCreatedHandler(self)
        self.chunk_change_handler = ChunkChangedHandler(self)
        self._watches: Dict[str, ObservedWatch] = dict()
        self.new_chunk_observer.schedule(self.new_chunk_handler, self.chunks_dir, recursive=False)

        self._stop_event = threading.Event()
        self._index_thread = None
        self._monitor_thread = None

    def start(self):
        self._stop_event.clear()
        self.new_chunk_observer.start()
        self.chunk_change_observer.start()

        if not self._index_thread or not self._index_thread.is_alive():
            self._index_thread = threading.Thread(target=self._process_indexing_queue, daemon=True)
            self._index_thread.start()

        if not self._monitor_thread or not self._monitor_thread.is_alive():
            self._monitor_thread = threading.Thread(target=self._monitor_existing_chunks, daemon=True)
            self._monitor_thread.start()

    def stop(self):
        self._stop_event.set()
        self.new_chunk_observer.stop()
        self.chunk_change_observer.stop()
        if self._monitor_thread:
            self._monitor_thread.join()
        if self._index_thread:
            self._index_thread.join()

    def _monitor_existing_chunks(self):
        while not self._stop_event.is_set():
            index_db = self.repo.request_tree('meta', read_only=True)
            monitored_chunks = set(self._watches.keys())
            for chunk_path in self.chunks_dir.iterdir():
                if (
                    chunk_path.is_dir()
                    and chunk_path.name not in monitored_chunks
                    and self._is_run_index_outdated(chunk_path.name, index_db)
                ):
                    logger.debug(f'Monitoring existing chunk: {chunk_path}')
                    self.monitor_chunk_directory(chunk_path)
                    logger.debug(f'Triggering indexing for run {chunk_path.name}')
                    self.add_run_to_queue(chunk_path.name)
            self.repo.container_pool.clear()
            time.sleep(5)

    def _stop_monitoring_chunk(self, run_hash):
        watch = self._watches.pop(run_hash, None)
        if watch:
            self.chunk_change_observer.unschedule(watch)
            logger.debug(f'Stopped monitoring chunk: {run_hash}')

    def monitor_chunk_directory(self, chunk_path):
        """Ensure chunk directory is monitored using a single handler."""
        if chunk_path.name not in self._watches:
            watch = self.chunk_change_observer.schedule(self.chunk_change_handler, chunk_path, recursive=True)
            self._watches[chunk_path.name] = watch
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

    def _process_indexing_queue(self):
        while not self._stop_event.is_set():
            _, run_hash = self.indexing_queue.get()
            logger.debug(f'Indexing run {run_hash}...')
            self.index(run_hash)
            self.indexing_queue.task_done()

    def index(self, run_hash):
        index = self.repo._get_index_tree('meta', 0).view(())
        try:
            run_checksum = self._get_run_checksum(run_hash)
            meta_tree = self.repo.request_tree('meta', run_hash, read_only=True, skip_read_optimization=True).subtree(
                'meta'
            )
            meta_run_tree = meta_tree.subtree('chunks').subtree(run_hash)
            meta_run_tree.finalize(index=index)
            index['index_cache', run_hash] = run_checksum

            if meta_run_tree.get('end_time') is not None:
                logger.debug(f'Indexing thread detected finished run: {run_hash}. Stopping monitoring...')
                self._stop_monitoring_chunk(run_hash)

        except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
            logger.warning(f'Indexing thread detected corrupted run: {run_hash}. Skipping.')
            self._corrupted_runs.add(run_hash)
        return True

    def _is_run_index_outdated(self, run_hash, index_db):
        return self._get_run_checksum(run_hash) != index_db.get(('index_cache', run_hash))

    def _get_run_checksum(self, run_hash):
        hash_obj = hashlib.md5()

        for root, dirs, files in os.walk(os.path.join(self.chunks_dir, run_hash)):
            for name in sorted(files):  # sort to ensure consistent order
                if name.startswith('LOG'):  # skip access logs
                    continue
                filepath = os.path.join(root, name)
                try:
                    stat = os.stat(filepath)
                    hash_obj.update(filepath.encode('utf-8'))
                    hash_obj.update(str(stat.st_mtime).encode('utf-8'))
                    hash_obj.update(str(stat.st_size).encode('utf-8'))
                except FileNotFoundError:
                    # File might have been deleted between os.walk and os.stat
                    continue

        return hash_obj.hexdigest()
