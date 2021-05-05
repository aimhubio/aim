import time
from threading import Thread

from aim.web.utils import Singleton


class FileWatcher(metaclass=Singleton):
    files = []
    callback = None

    @classmethod
    def set_files(cls, files):
        cls.files = files

    def __init__(self, interval=1000):
        self.interval = interval
        self._thread = Thread(target=self._watcher_body, daemon=True)

    def start(self):
        self._thread.start()

    def _watcher_body(self):
        while True:
            try:
                updates = {}
                for f in FileWatcher.files:
                    for u in f.get_updates():
                        updates.setdefault(f, [])
                        try:
                            deserialized_u = f.deserialize_item(u)
                        except:
                            continue
                        else:
                            f.inc_cursor()
                        updates[f].append(deserialized_u)

                if updates and len(updates) > 0 and FileWatcher.callback:
                    FileWatcher.callback(updates)
            except:
                time.sleep(0.1)
                continue

            time.sleep(self.interval / 1000)
