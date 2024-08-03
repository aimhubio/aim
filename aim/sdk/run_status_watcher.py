import json
import logging
import queue
import time

from abc import abstractmethod
from collections import OrderedDict
from pathlib import Path
from threading import Thread
from typing import Dict, Generic, Optional, TypeVar

from aim.ext.cleanup import AutoClean
from aim.ext.notifier import NotificationSendError, Notifier, get_config, get_notifier
from aim.ext.notifier.utils import get_working_directory
from aim.sdk.repo import Repo
from aim.sdk.run import Run
from aim.storage.locking import AutoFileLock
from cachetools.func import ttl_cache


logger = logging.getLogger(__name__)

GRACE_PERIOD = 100  # seconds

T = TypeVar('T')


class RepetitionCounter:
    def __init__(self, obj):
        self.obj = obj
        self.step = 0
        self.count = 0

    def update(self, step):
        self.count += 1
        self.step = max(step, self.step)


class RankedSet(Generic[T]):
    def __init__(self):
        self.events: Dict[str, T] = {}

    def get(self, obj_idx: str) -> T:
        return self.events[obj_idx]

    def add(self, event: T) -> bool:
        object_idx = event.obj_idx
        if object_idx not in self.events:
            self.events[object_idx] = event
            return True
        elif self.events[object_idx].idx < event.idx:
            self.events[object_idx] = event
            return True
        return False


class RunVariable:
    """Representation of Run object with run.hash only. To be replaced with real Run in the future."""

    def __init__(self, run_hash: str):
        self.hash = run_hash


class Event:
    def __init__(self, status_event_encoded: str):
        obj_idx, idx, event_type, epoch_time, next_event_in = status_event_encoded.split('-')
        self.idx: int = int(idx)
        self.obj_idx: str = obj_idx

        self.event_type = event_type
        self.next_event_in: int = int(next_event_in)
        self.epoch_time: float = float(epoch_time)
        self.detected_epoch_time: float = time.time()


EventSet = RankedSet[Event]


class Notification:
    def __init__(self, *, obj_idx: Optional[str] = None, rank: Optional[int] = None, message: Optional[str] = None):
        self.rank = rank
        self.obj_idx = obj_idx
        self.message = message

    @abstractmethod
    def is_sent(self): ...

    @abstractmethod
    def update_last_sent(self): ...

    @abstractmethod
    def get_msg_details(self): ...


class StatusNotification(Notification):
    _notifications_cache_path: Path = None
    notifications_cache: Dict[str, int] = {}

    @classmethod
    def recover_notifications_cache(cls, cache_path: Path):
        cls._notifications_cache_path = cache_path
        with cls._notifications_cache_path.open() as cache_fh:
            try:
                cls.notifications_cache = json.load(cache_fh)
            except json.decoder.JSONDecodeError:
                cls.notifications_cache = {}

    def get_msg_details(self):
        return {'run': RunVariable(self.obj_idx)}

    def is_sent(self) -> bool:
        last_event_idx = self.notifications_cache.get(self.obj_idx, -1)
        if self.rank is None or last_event_idx < self.rank:
            return False
        elif last_event_idx == self.rank:
            return True
        else:
            logger.warning(
                f"New event id {self.rank} for object '{self.obj_idx}' "
                f'is less than last reported event id {last_event_idx}.'
            )
            return True

    def update_last_sent(self):
        if self.rank is not None:
            self.notifications_cache[self.obj_idx] = self.rank
            with self._notifications_cache_path.open(mode='w') as notifications_fh:
                json.dump(self.notifications_cache, notifications_fh)


class LogNotification(Notification):
    _repo: Repo = None

    @classmethod
    def set_repo(cls, repo: Repo):
        cls._repo = repo

    def get_msg_details(self):
        return {}

    def is_sent(self) -> bool:
        run = self._repo.structured_db.find_run(self.obj_idx)
        return self.rank < run.info.last_notification_index

    def update_last_sent(self):
        run = self._repo.structured_db.find_run(self.obj_idx)
        run.info.last_notification_index = self.rank


class WorkerThread(Thread):
    def __init__(self, func, **kwargs):
        self.shutdown = False
        self.func = func
        super().__init__(target=self.worker, **kwargs)

    def worker(self):
        while True:
            if self.shutdown:
                break
            self.func()

    def stop(self):
        logger.debug('Stopping worker thread...')
        self.shutdown = True
        self.join()
        logger.debug('Worker thread stopped.')


class NotificationQueue(object):
    def __init__(self, notifier: Notifier):
        self._stopped = False
        self._notifier = notifier

        self._queue = queue.Queue()
        self._notifier_thread = Thread(target=self.listen, daemon=True)
        self._notifier_thread.start()

    def add_notification(self, notification: Notification):
        if not notification.is_sent():
            self._queue.put(notification)

    def stop(self):
        logger.debug('Processing remaining notifications...')
        self._queue.join()
        logger.debug('Notifications queue is empty.')
        logger.debug('Stopping worker thread...')
        self._stopped = True
        self._notifier_thread.join()
        logger.debug('Worker thread stopped.')

    def listen(self):
        while True:
            if self._stopped:
                break
            try:
                notification = self._queue.get(timeout=1)
                if notification.is_sent():
                    logger.debug(
                        f"Notification for object '{notification.obj_idx}' "
                        f'with event ID {notification.rank} has already been sent. Skipping.'
                    )
                else:
                    details = notification.get_msg_details()
                    try:
                        self._notifier.notify(notification.message, **details)
                        notification.update_last_sent()
                    except NotificationSendError as e:
                        logger.error(f'Failed to send notification. Reason: {e}.')
                self._queue.task_done()
            except queue.Empty:
                continue


class RunStatusWatcherAutoClean(AutoClean['RunStatusWatcher']):
    PRIORITY = 30

    def __init__(self, instance: 'RunStatusWatcher') -> None:
        super().__init__(instance)
        self.is_background = instance.background
        self.watcher_thread = instance.watcher_thread
        self.notifications_queue = instance.notifications_queue
        self.lock = instance.lock

    def _close(self) -> None:
        if self.is_background:
            assert self.watcher_thread is not None
            self.watcher_thread.stop()
        self.notifications_queue.stop()
        self.lock.release()


class RunStatusWatcher:
    message_templates = {
        'finished': "Run '{run.hash}' finished without error.",
        'starting': "Run '{run.hash}' started.",
    }

    def __init__(self, repo: Repo, background: bool = False):
        self.repo_path = Path(repo.path)
        self.repo = repo
        self.background = background

        self._resources = None
        self._log_lvl_threshold = None
        self.initialized = False

        work_dir = get_working_directory(self.repo_path)
        self.lock = AutoFileLock(work_dir / 'watcher.lock', timeout=0)
        try:
            self.lock.acquire()
        except TimeoutError:
            logger.error(f"Cannot start Run status watcher for '{self.repo_path}'. Failed to acquire lock.")
            return

        self._status_watch_dir: Path = self.repo_path / 'check_ins'
        self._status_watch_dir.mkdir(exist_ok=True)

        self._notifications_cache_path: Path = work_dir / 'last_run_notifications'
        self._notifications_cache_path.touch(exist_ok=True)
        self._status_events = EventSet()
        self._log_events = EventSet()

        self.notifier = get_notifier(self.repo_path)
        self.watcher_thread = WorkerThread(self.check_for_new_events, daemon=True) if not background else None
        self.notifications_queue = NotificationQueue(self.notifier)

        StatusNotification.recover_notifications_cache(self._notifications_cache_path)
        LogNotification.set_repo(self.repo)

        self.initialized = True
        self._resources = RunStatusWatcherAutoClean(self)

    @property
    @ttl_cache(maxsize=None, ttl=10)
    def log_level_threshold(self):
        lvl = get_config(self.repo_path).log_level
        if self._log_lvl_threshold is not None:
            if self._log_lvl_threshold != lvl:
                logger.warning(
                    f'Log Notifications level changed '
                    f"from '{logging.getLevelName(self._log_lvl_threshold)}' "
                    f"to '{logging.getLevelName(lvl)}'."
                )
                self._log_lvl_threshold = lvl
        else:
            logger.warning(f"Running with Log Notifications level '{logging.getLevelName(lvl)}'")
            self._log_lvl_threshold = lvl
        return lvl

    def start_watcher(self):
        if not self.initialized:
            return
        logger.info('Starting watcher...')
        notification = StatusNotification(message=f"Watcher is running for repo '{self.repo_path}'")
        self.notifications_queue.add_notification(notification)
        if self.background:
            self.watcher_thread.start()
        else:
            self.run_forever()

    def run_forever(self):
        while True:
            self.check_for_new_events()
            time.sleep(1)

    def check_for_new_events(self):
        status_events = self.poll_status_events()
        for new_event in status_events.events.values():
            if not self._status_events.add(new_event):
                event = self._status_events.get(new_event.obj_idx)
                if event.next_event_in == 0:  # wait for next check-in for infinite time
                    continue
                epoch_now = time.time()
                failure = event.next_event_in + GRACE_PERIOD < epoch_now - event.detected_epoch_time
                if failure:
                    notification = StatusNotification(obj_idx=event.obj_idx, rank=event.idx)
                    self.notifications_queue.add_notification(notification)
            elif new_event.event_type in self.message_templates:
                message = self.message_templates[new_event.event_type]
                notification = StatusNotification(obj_idx=new_event.obj_idx, rank=new_event.idx, message=message)
                self.notifications_queue.add_notification(notification)

        self.repo.persistent_pool.clear()

        log_events = self.poll_log_record_events()
        for new_event in log_events.events.values():
            if self._log_events.add(new_event):
                run_hash = new_event.obj_idx
                run = Run(run_hash, repo=self.repo, read_only=True)
                run_info = run.props.info
                log_records_seq = run.get_log_records()
                if log_records_seq:
                    last_log_index = log_records_seq.last_step()
                    last_notified_index = run_info.last_notification_index
                    if last_log_index > last_notified_index:
                        data = log_records_seq.data.range(last_notified_index + 1, last_log_index + 1)
                        for rec_hash, counter in self._processed_log_records(data).items():
                            assert counter.count > 0
                            if counter.count == 1:
                                message = counter.obj.message
                            else:
                                message = f'{counter.obj.message} ({counter.count - 1} more messages logged)'
                            notification = LogNotification(obj_idx=run_hash, rank=counter.step, message=message)
                            self.notifications_queue.add_notification(notification)

    def poll_status_events(self) -> EventSet:
        return self._poll(event_types=('finished', 'starting', 'check_in'))

    def poll_log_record_events(self) -> EventSet:
        return self._poll(event_types=('new_logs',))

    def _poll(self, event_types) -> EventSet:
        events = EventSet()
        for event_type in event_types:
            for check_in_file_path in sorted(self._status_watch_dir.glob(f'*-*-{event_type}-*-*')):
                events.add(Event(check_in_file_path.name))
        return events

    def _processed_log_records(self, log_records_data) -> Dict:
        log_level = self.log_level_threshold

        steps, log_records = log_records_data.view('val').items_list()
        log_records = log_records[0]

        log_info_map = OrderedDict()
        for step, log_record in zip(steps, log_records):
            if log_record.level >= log_level:
                log_info_map.setdefault(hash(log_record), RepetitionCounter(log_record)).update(step)
        return log_info_map
