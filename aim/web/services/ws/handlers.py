import uuid
import json
from threading import Thread, Lock
from tornado import websocket, escape
import base64

from aim.web.services.watcher.file import File
from aim.web.services.watcher.file_watcher import FileWatcher


class InsightSocketHandler(websocket.WebSocketHandler):
    clients = {}
    client_files = {}
    files_watch_list = set()
    lock = Lock()
    publisher = None

    def __init__(self, *args, **kwargs):
        self.client_id = uuid.uuid4().hex
        if not InsightSocketHandler.publisher:
            InsightSocketHandler.publisher = Thread()
        FileWatcher.callback = InsightSocketHandler.on_update
        super().__init__(*args, **kwargs)

    def check_origin(self, origin):
        return True

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def open(self):
        InsightSocketHandler.lock.acquire()
        InsightSocketHandler.clients[self.client_id] = self
        InsightSocketHandler.client_files[self.client_id] = set()
        InsightSocketHandler.lock.release()

    def on_close(self):
        InsightSocketHandler.lock.acquire()

        if self.client_id in InsightSocketHandler.clients:
            del InsightSocketHandler.clients[self.client_id]

        if self.client_id in InsightSocketHandler.client_files:
            del InsightSocketHandler.client_files[self.client_id]

        self.update_file_watch_list()
        InsightSocketHandler.lock.release()

    def on_message(self, message):
        parsed_msg = escape.json_decode(message)

        event = parsed_msg.get('event')
        if not event:
            return

        if event == 'subscribe':
            self.subscribe(parsed_msg.get('data'))
        elif event == 'unsubscribe':
            self.unsubscribe(parsed_msg.get('data'))
        else:
            # Handle other events
            return

    def subscribe(self, data):
        InsightSocketHandler.lock.acquire()

        file = self.get_event_file(data)
        InsightSocketHandler.client_files[self.client_id].add(file)

        self.update_file_watch_list()
        InsightSocketHandler.lock.release()

    def unsubscribe(self, data):
        InsightSocketHandler.lock.acquire()

        file = self.get_event_file(data)
        if file in InsightSocketHandler.client_files[self.client_id]:
            InsightSocketHandler.client_files[self.client_id].remove(file)

        self.update_file_watch_list()
        InsightSocketHandler.lock.release()

    @classmethod
    def on_update(cls, updates):
        for client_id, client_files in InsightSocketHandler.client_files.items():
            for client_file in client_files:
                for update_file, u in updates.items():
                    if client_file == update_file:
                        cls.send_updates(client_id, client_file, u)

    @classmethod
    def update_file_watch_list(cls):
        updated_watch_list = set()
        for files in cls.client_files.values():
            for i in files:
                updated_watch_list.add(i)
        cls.files_watch_list = updated_watch_list
        FileWatcher.set_files(updated_watch_list)

    @classmethod
    def get_event_file(cls, file_hash):
        file_data = cls.decode_file_hash(file_hash)
        return File(hash=file_hash, data=file_data)

    @staticmethod
    def decode_file_hash(header):
        header_json = base64.b64decode(header.encode()).decode()
        header_data = json.loads(header_json)
        return header_data

    @classmethod
    def send_updates(cls, client_id, client_file, updates):
        for u in updates:
            cls.clients[client_id].write_message(json.dumps({
                'event': 'insight_update',
                'header': client_file.hash,
                'data': u,
            }))
