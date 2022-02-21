import threading
import queue
import atexit
import logging
import time
import grpc

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
            warn_queue_full = self._put(task_func, *args, **kwargs)
        return warn_queue_full

    def worker(self):
        while True:
            if self._shutdown:
                logger.debug(f'Shutting down worker thread {threading.get_ident()}.')
                break
            task_f, args, kwargs = self._queue.get()
            self._try_worker(task_f, *args, **kwargs)

            # clear the unnecessary references to Run objects
            task_f, args, kwargs = None, None, None
            self._queue.task_done()

    def wait_for_finish(self):
        self._queue.join()

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

    def _try_worker(self, task_f, *args, **kwargs):
        task_f(*args, **kwargs)

    def _put(self, task_f, *args, **kwargs):
        warn_queue_full = False
        backlog_size = self._queue.qsize()
        if backlog_size > self.max_backlog * 0.8:  # queue is 80% full
            warn_queue_full = True
        self._queue.put((task_f, args, kwargs))
        return warn_queue_full


class TaskQueueWithRetry(TaskQueue):
    def __init__(self, name, num_workers=1, max_queue_memory=0,
                 retry_count=0, retry_interval=0):
        super().__init__(name, num_workers)

        self.retry_count = retry_count or 1
        self.retry_interval = retry_interval

        self.max_memory_usage = max_queue_memory
        self.current_memory_usage = 0

    def _try_worker(self, task_f, *args, **kwargs):
        assert len(kwargs) == 0

        retry = 0
        while retry < self.retry_count:
            try:
                task_f(*args, **kwargs)
                arg_size = self._calculate_size(args)
                with self._queue.mutex:
                    self.current_memory_usage -= arg_size
                return True
            except grpc.RpcError as e:
                if e.code() != grpc.StatusCode.UNAVAILABLE:
                    raise e

                retry += 1
                logger.warning(f'Remote Server is unavailable, please check network connection: {e}, attempt: {retry}')
                time.sleep(self.retry_interval)

        # TODO [AD] should we put task into queue in case of exception?
        #  is this true for normal (non RT) cases as well?
        self._put((task_f, args, kwargs))
        return False

    def _put(self, task_f, *args, **kwargs):
        assert len(kwargs) == 0

        arg_size = self._calculate_size(args)
        with self._queue.not_full:
            while self.current_memory_usage + arg_size >= self.max_memory_usage:
                self._queue.not_full.wait()

        with self._queue.mutex:
            self.current_memory_usage += arg_size

        self._queue.put((task_f, args, kwargs))
        return False

    @staticmethod
    def _calculate_size(args):
        size = 0
        assert type(args) is tuple
        for arg in args[0]:
            assert type(arg) is tuple
            assert len(arg) == 2
            size += len(arg[0]) + len(arg[1])
        return size
