from tensorboard.backend.event_processing.directory_watcher import DirectoryWatcher
from tensorboard.backend.event_processing import event_file_loader
import tensorflow as tf
from tensorboard.util import tensor_util
import time
import threading
from pathlib import Path
import logging
import os
import weakref
import queue

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from aim import Audio, Image


class TensorboardTracker:
    def __init__(self, tracker, sync_tensorboard_log_dir: str) -> None:
        self.tracker = tracker
        self.sync_tensorboard_log_dir = sync_tensorboard_log_dir
        self.tensorboard_folder_watchers = []
        self._thread = threading.Thread(target=self._monitor_eventfiles, daemon=True)
        self.directories_track_status = {}
        self._shutdown = False
        self._started = False
        self._watcher_queue = queue.Queue()

    def _monitor_eventfiles(self):
        while True:
            if self._shutdown:
                break
            for event_file in set(Path(self.sync_tensorboard_log_dir).rglob("*.tfevents*")):
                dir = str(event_file.parent.absolute())
                if dir not in self.directories_track_status:
                    self.directories_track_status[dir] = "NOT_STARTED"
            for dir, status in self.directories_track_status.items():
                if status == "NOT_STARTED":
                    tensorboard_folder_watcher = TensorboardFolderTracker(dir, self._watcher_queue)
                    tensorboard_folder_watcher.start()
                    self.tensorboard_folder_watchers.append(tensorboard_folder_watcher)
                    self.directories_track_status[dir] = "STARTED"
            time.sleep(5)

    def start(self):
        if self._started:
            return
        self._started = True
        self._thread.start()
        self._consumer = TensorboardEventConsumer(
            self._watcher_queue, self.tracker
        )
        self._consumer.start()

    def stop(self):
        if not self._started:
            return
        self._shutdown = True
        self._thread.join()
        for tensorboard_folder_watcher in self.tensorboard_folder_watchers:
            tensorboard_folder_watcher.stop()
        self._consumer.stop()

    def close(self):
        """Interface to make compatible with Resource AutoClean"""
        self.stop()


class TensorboardFolderTracker:
    def __init__(self, tensorboard_event_folder: str, queue: queue.Queue) -> None:
        self.queue = queue
        self.supported_plugins = ("images", "scalars")
        self.unsupported_plugin_noticed = False
        self.folder_name = os.path.basename(tensorboard_event_folder)
        self._thread = threading.Thread(target=self._process_event)
        self._generator = DirectoryWatcher(tensorboard_event_folder, event_file_loader.EventFileLoader)
        self._shutdown = False
        self._started = False

    def start(self):
        if self._started:
            return
        self._started = True
        self._thread.start()

    def stop(self):
        if not self._started:
            return
        self._shutdown = True
        self._thread.join()

    def _process_event(self):
        while True:
            if self._shutdown:
                break
            for event in self._generator.Load():
                self._process_tb_event(event)
            time.sleep(1)

    def _process_tb_event(self, event):
        def create_ndarray(tensor):
            res = tensor_util.make_ndarray(tensor)
            if res.dtype == "object":
                return None
            else:
                return res

        step = event.step
        fail_count = 0
        _err_info = None

        for value in event.summary.value:
            tag = value.tag
            plugin_name = value.metadata.plugin_data.plugin_name
            if len(plugin_name) > 0 and plugin_name not in self.supported_plugins:
                if not self.unsupported_plugin_noticed:
                    logging.warning(
                        "Found unsupported plugin type({}) in the log file. "
                        "Data for these wont be processed. "
                        "Supported plugin types are: {}".format(plugin_name, ", ".join(self.supported_plugins)),
                    )
                    self.unsupported_plugin_noticed = True
                continue
            track_val = None
            try:
                if value.HasField("tensor"):
                    # TODO: [MV] check the case when audios are passed via tensor
                    if plugin_name == "images":
                        tensor = value.tensor.string_val[2:]
                        track_val = [Image(tf.image.decode_image(t).numpy()) for t in tensor]
                        if len(track_val) == 1:
                            track_val = track_val[0]
                    elif plugin_name == "scalars" or plugin_name == "":
                        track_val = create_ndarray(value.tensor)
                    else:
                        track_val = value.tensor.float_val[0]
                elif value.HasField("simple_value"):
                    track_val = value.simple_value
                elif value.HasField("image"):
                    track_val = Image(tf.image.decode_image(value.image.encoded_image_string).numpy())
                elif value.HasField("audio"):
                    tf_audio, sample_rate = tf.audio.decode_wav(value.audio.encoded_audio_string)
                    track_val = Audio(tf_audio.numpy(), rate=sample_rate)

            except RuntimeError as exc:
                # catch all the nasty failures
                fail_count += 1
                if not _err_info:
                    _err_info = str(exc)
                continue

            if track_val is not None:
                self.queue.put(TensorboardEvent(track_val, tag, step, context={'entry': self.folder_name}))
        if fail_count:
            logging.warning(f"Failed to process {fail_count} entries. First exception: {_err_info}")


class TensorboardEvent:

    def __init__(self, value: Any, name: str, step: int, context: dict) -> None:
        self.value = value
        self.name = name
        self.step = step
        self.context = context


class TensorboardEventConsumer:

    def __init__(self, queue: queue.Queue, tracker) -> None:
        self._tracker = weakref.ref(tracker)
        self._queue = queue
        self._thread = threading.Thread(target=self._process_events, daemon=True)
        self._shutdown = False
        self._started = False

    def start(self):
        if self._started:
            return
        self._started = True
        self._thread.start()

    def _process_events(self):
        while True:
            try:
                event = self._queue.get(True, 1)
                if event:
                    self._tracker()(event.value, event.name, event.step, context=event.context)
            except queue.Empty:
                event = None
                if self._shutdown:
                    break

    def stop(self):
        if not self._started:
            return
        self._shutdown = True
        self._thread.join()
