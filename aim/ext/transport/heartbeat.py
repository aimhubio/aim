import datetime
import logging
import time
import weakref

from collections import Counter
from threading import Thread
from typing import Union


logger = logging.getLogger(__name__)


class HeartbeatSender(object):
    HEARTBEAT_INTERVAL_DEFAULT = 10
    NETWORK_CHECK_INTERVAL = 180

    NETWORK_UNSTABLE_WARNING_TEMPLATE = 'Network connection between client `{}` and server `{}` appears to be unstable.'
    NETWORK_ABSENT_WARNING_TEMPLATE = 'Network connection between client `{}` and server `{}` appears to be absent.'

    def __init__(
        self,
        client,
        interval: Union[int, float] = HEARTBEAT_INTERVAL_DEFAULT,
    ):
        self._remote_client = weakref.ref(client)
        self._heartbeat_send_interval = interval

        # network state check vars
        self._network_stability_check_interval = HeartbeatSender.NETWORK_CHECK_INTERVAL
        self._network_unstable_warned = False
        self._network_absent_warned = False
        self._heartbeat_responses = Counter(success=0, fail=0)

        # Start thread to collect stats and logs at intervals
        self._th_collector = Thread(target=self._target_f, daemon=True)
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
        if self._remote_client():
            try:
                response = self._remote_client().client_heartbeat()
                if response.status_code == 200:
                    self._heartbeat_responses['success'] += 1
                else:
                    self._heartbeat_responses['fail'] += 1
            except Exception:
                # at the moment we don't care about failures for heartbeats
                self._heartbeat_responses['fail'] += 1

    def _target_f(self):
        heartbeat_interval_counter = 0
        stability_check_interval_counter = 0
        # send initial heartbeat
        self._send_heartbeat()

        while True:
            if self._shutdown:
                break

            time.sleep(1)
            heartbeat_interval_counter += 1
            stability_check_interval_counter += 1

            if heartbeat_interval_counter > self._heartbeat_send_interval:
                self._send_heartbeat()
                heartbeat_interval_counter = 0

            if stability_check_interval_counter > self._network_stability_check_interval:
                self._check_network_state()
                stability_check_interval_counter = 0

    def _check_network_state(self):
        def reset_responses():
            self._heartbeat_responses['fail'] = 0
            self._heartbeat_responses['success'] = 0

        if not self._heartbeat_responses['fail']:
            reset_responses()
            return

        if self._heartbeat_responses['success'] and not self._network_unstable_warned:
            self._network_unstable_warned = True
            logger.warning(
                HeartbeatSender.NETWORK_UNSTABLE_WARNING_TEMPLATE.format(
                    self._remote_client().uri, self._remote_client().remote_path
                )
            )
            reset_responses()
            return

        if not self._network_absent_warned:
            self._network_absent_warned = True
            logger.warning(
                HeartbeatSender.NETWORK_ABSENT_WARNING_TEMPLATE.format(
                    self._remote_client().uri, self._remote_client().remote_path
                )
            )

        reset_responses()


class HeartbeatWatcher:
    CLIENT_KEEP_ALIVE_TIME_DEFAULT = 5 * 60  # 5 minutes

    def __init__(self, heartbeat_pool, keep_alive_time: Union[int, float] = CLIENT_KEEP_ALIVE_TIME_DEFAULT):
        self._heartbeat_pool = heartbeat_pool

        self._client_keep_alive_time = keep_alive_time

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

    def _release_client_resources(self, dead_client_uri):
        logger.warning(f'Cleaning up resources for client `{dead_client_uri}`.')
        from aim.ext.transport.router import ClientRouter
        from aim.ext.transport.tracking import TrackingRouter

        TrackingRouter.cleanup_client_resources(dead_client_uri)
        ClientRouter.remove_client(dead_client_uri)

    def _interval_check(self):
        while True:
            # Get system statistics
            if self._shutdown:
                break

            time.sleep(1)

            client_uris = list(self._heartbeat_pool.keys())
            for client_uri in client_uris:
                now = datetime.datetime.now().timestamp()
                if now - self._heartbeat_pool[client_uri] > self._client_keep_alive_time:
                    self._release_client_resources(client_uri)
                    del self._heartbeat_pool[client_uri]
