import time
import os
import datetime
import pytz
import threading
from pathlib import Path

from typing import Iterable

import aimrocks.errors

from aim import Repo
from aim.sdk.run_status_watcher import Event


class RunStatusManager:
    INDEXING_GRACE_PERIOD = 10

    def __init__(self, repo: Repo, scan_interval: int = 60):
        self.repo = repo
        self.scan_interval = scan_interval

        self.progress_dir = Path(self.repo.path) / 'meta' / 'progress'
        self.progress_dir.mkdir(parents=True, exist_ok=True)

        self.heartbeat_dir = Path(self.repo.path) / 'check_ins'
        self.run_heartbeat_cache = {}

        self._stop_event = threading.Event()
        self._monitor_thread = None
        self._corrupted_runs = set()

    def start(self):
        if not self._monitor_thread or not self._monitor_thread.is_alive():
            self._stop_event.clear()
            self._monitor_thread = threading.Thread(target=self._run_forever, daemon=True)
            self._monitor_thread.start()

    def stop(self):
        self._stop_event.set()
        if self._monitor_thread:
            self._monitor_thread.join()

    def _run_forever(self):
        while not self._stop_event.is_set():
            self.check_and_terminate_stalled_runs()
            time.sleep(self.scan_interval)

    def _runs_with_progress(self) -> Iterable[str]:
        runs_with_progress = filter(lambda x: x not in self._corrupted_runs, os.listdir(self.progress_dir))
        run_hashes = sorted(runs_with_progress, key=lambda r: os.path.getmtime(os.path.join(self.progress_dir, r)))
        return run_hashes

    def check_and_terminate_stalled_runs(self):
        for run_hash in self._runs_with_progress():
            if self._is_run_stalled(run_hash):
                self._mark_run_as_terminated(run_hash)

    def _is_run_stalled(self, run_hash: str) -> bool:
        stalled = False

        heartbeat_files = list(sorted(self.heartbeat_dir.glob(f'{run_hash}-*-progress-*-*'), reverse=True))
        if heartbeat_files:
            latest_file = heartbeat_files[0].name
            last_heartbeat = Event(latest_file)

            last_recorded_heartbeat = self.run_heartbeat_cache.get(run_hash)
            if last_recorded_heartbeat is None:
                # First time seeing a heartbeat for this run; store and move on
                self.run_heartbeat_cache[run_hash] = last_heartbeat
            elif last_heartbeat.idx > last_recorded_heartbeat.idx:
                # Newer heartbeat arrived, so the run isn't stalled
                self.run_heartbeat_cache[run_hash] = last_heartbeat
            else:
                # No new heartbeat event since last time; check if enough time passed
                time_passed = time.time() - last_recorded_heartbeat.detected_epoch_time
                if (last_recorded_heartbeat.next_event_in + RunStatusManager.INDEXING_GRACE_PERIOD) < time_passed:
                    stalled = True
        else:
            stalled = True

        return stalled

    def _mark_run_as_terminated(self, run_hash: str):
        # TODO [AT]: Add run state handling once decided on terms (finished, terminated, aborted, etc.)
        try:
            meta_run_tree = self.repo.request_tree('meta', run_hash, read_only=False).subtree(
                ('meta', 'chunks', run_hash)
            )
            if meta_run_tree.get('end_time') is None:
                meta_run_tree['end_time'] = datetime.datetime.now(pytz.utc).timestamp()
            progress_path = self.progress_dir / run_hash
            progress_path.unlink(missing_ok=True)
        except (aimrocks.errors.RocksIOError, aimrocks.errors.Corruption):
            self._corrupted_runs.add(run_hash)
