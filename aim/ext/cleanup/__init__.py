import logging
import threading

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
                logger.warning("Received Ctrl-C. Closing gracefully.")
