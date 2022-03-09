import threading
import queue
import atexit
import logging

logger = logging.getLogger(__name__)


class TaskQueue(object):
    def __init__(self, name, num_workers=1, max_backlog=0):
        self.name = name
        self.max_backlog = max_backlog
        self.num_workers = num_workers

        self._queue = queue.Queue(maxsize=max_backlog)

        self._threads = []
        self._shutdown = False
        self._stopped = False
        atexit.register(self.stop_workers)

        for thread_num in range(self.num_workers):
            thread = threading.Thread(target=self.worker)
            thread.daemon = True
            self._threads.append(thread)
            thread.start()

    def register_task(self, task_func, *args, **kwargs):
        warn_queue_full = False
        if self._stopped:
            logger.debug('Cannot register task: task queue is stopped.')
        else:
            backlog_size = self._queue.qsize()
            if backlog_size > self.max_backlog * 0.8:  # queue is 80% full
                warn_queue_full = True
            self._queue.put((task_func, args, kwargs))
        return warn_queue_full

    def worker(self):
        while True:
            if self._shutdown:
                logger.debug(f'Shutting down worker thread {threading.get_ident()}.')
                break
            task_f, args, kwargs = self._queue.get()
            task_f(*args, **kwargs)
            # clear the unnecessary references to Run objects
            task_f, args, kwargs = None, None, None
            self._queue.task_done()

    def stop_workers(self):
        if self._stopped:
            return

        self._stopped = True
        pending_task_count = self._queue.qsize()
        if pending_task_count:
            logger.warning(f'Processing {pending_task_count} pending tasks in queue \'{self.name}\'... '
                           f'Please do not kill the process.')
            self._queue.join()
        self._shutdown = True
        logger.debug('No pending tasks left.')

    def __del__(self):
        self.stop_workers()
