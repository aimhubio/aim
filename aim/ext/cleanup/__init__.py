from abc import abstractmethod

import atexit
import weakref
import logging
import threading

from typing import Generic, Tuple, TypeVar, Dict

T = TypeVar('T')

logger = logging.getLogger(__name__)


class RobustExec(threading.Thread):
    """
    A thread that executes a function and catches all soft interrupts.
    Users very often Ctrl-C to stop the program multiple times which leaves
    program no chance to clean up.
    """
    def join(self):
        while True:
            try:
                # Pressing Ctrl-C will raise KeyboardInterrupt and stop only
                # the `Thread.join()` call. The target function of `RobustExec`
                # will continue to run.
                return super().join()
            except KeyboardInterrupt:
                logger.warning('Received Ctrl-C. Closing gracefully.')


class AutoClean(Generic[T]):
    PRIORITY = 10
    _registered_with_atexit = False
    _finalizers: Dict[
        T, Tuple[int, weakref.finalize]
    ] = weakref.WeakKeyDictionary()

    def __init__(self, instance: T) -> None:
        """
        Initialize object resources that need to be cleaned up automatically.
        """
        self.finalizer = weakref.finalize(instance, self._close)
        # We do not finalizer to automatically close the object itself.
        # Instead, we will collect all finalizers and call them at exit.
        self.finalizer.atexit = False
        self._finalizers[instance] = (self.PRIORITY, self.finalizer)

        if not self._registered_with_atexit:
            atexit.register(self.cleanup)
            self._registered_with_atexit = True

    def close(self) -> None:
        """Manually close the object."""
        self.finalizer()

    @abstractmethod
    def _close(self):
        """
        This method is called when the instance is garbage collected.
        Meant to be overridden by subclasses.
        """
        ...

    @staticmethod
    def _cleanup():
        """
        Actually cleanup all the remaining objects in order of specified
        priorities. This is called automatically by atexit.
        It is not meant tobe called manually.
        """
        finalizers = sorted(AutoClean._finalizers.items(), key=lambda x: x[1][0])
        logger.debug(f'Cleaning up...  Found {len(finalizers)} finalizers')
        logger.debug('Cleaning up...  Iterating over instances in order')
        for key, (priority, finalizer) in finalizers:
            logger.debug(f'Cleaning up...  with priority={priority} instance {key}')
            finalizer()

    @classmethod
    def cleanup(cls):
        """
        Cleanup all the remaining objects. This is called automatically
        when the program exits.
        It also blocks until all the cleanup functions have finished to ensure
        data consistency.
        """
        logger.debug('Cleaning up...  Blocking KeyboardInterrupts')
        example = RobustExec(target=cls._cleanup)
        example.start()
        example.join()
        logger.debug('Cleaning up...  Done')
