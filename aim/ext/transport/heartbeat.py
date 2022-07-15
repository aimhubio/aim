import datetime
import logging
import time
import weakref

from threading import Thread
from typing import Union


logger = logging.getLogger(__name__)


class RPCHeartbeatSender(object):

    HEARTBEAT_INTERVAL_DEFAULT = 60

    def __init__(self,
                 client,
                 interval: Union[int, float] = HEARTBEAT_INTERVAL_DEFAULT,
                 ):
        self._remote_client = weakref.ref(client)
        self._heartbeat_send_interval = interval

        # Start thread to collect stats and logs at intervals
        self._th_collector = Thread(target=self._send_heartbeat, daemon=True)
        self._shutdown = False
        self._started = False

    def start(self):
        if self._started:
            return

        self._started = True
        self._th_collector.start()

    def stop(self):
        if not self._started:
            return

        self._shutdown = True
        self._th_collector.join()

    def _send_heartbeat(self):
        while True:
            # Get system statistics
            if self._shutdown:
                break

            time.sleep(self._heartbeat_send_interval)

            if self._remote_client():
                try:
                    self._remote_client().health_check(health_check_type='heartbeat')
                except Exception:
                    # at the moment we don't care about failures for heartbeats
                    pass


class RPCHeartbeatWatcher:
    HEARTBEAT_CHECK_INTERVAL_DEFAULT = 30 * 60

    def __init__(self,
                 heartbeat_pool,
                 resource_pool,
                 interval: Union[int, float] = HEARTBEAT_CHECK_INTERVAL_DEFAULT):

        self._heartbeat_pool = heartbeat_pool
        self._resource_pool = resource_pool

        self._heartbeat_check_interval = interval

        # Start thread to collect stats and logs at intervals
        self._th_collector = Thread(target=self._interval_check, daemon=True)
        self._shutdown = False
        self._started = False

    def start(self):
        if self._started:
            return

        self._started = True
        self._th_collector.start()

    def stop(self):
        if not self._started:
            return

        self._shutdown = True
        self._th_collector.join()

    def _release_client_resources(self, check_client_uri):
        for handler, (client_uri, _) in self._resource_pool.items():
            if check_client_uri == client_uri:
                del self._resource_pool[handler]

    def _interval_check(self):
        heartbeat_interval_counter = 0
        while True:
            # Get system statistics
            if self._shutdown:
                break

            time.sleep(60)
            heartbeat_interval_counter += 60

            for client_uri, last_heartbeat_time in self._heartbeat_pool.items():
                if datetime.datetime.now().timestamp() - last_heartbeat_time > self._heartbeat_check_interval:
                    self._release_client_resources(client_uri)
                    heartbeat_interval_counter = 0
