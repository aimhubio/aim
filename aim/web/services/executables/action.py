from uuid import uuid4
import json
from base64 import b64encode


class Action:
    EXEC = 'execute'
    KILL = 'kill'
    SELECT = 'select'

    def __init__(self, action, data):
        self.action = action
        self.data = data
        self.id = uuid4()

    def serialize(self):
        return b64encode(json.dumps({
            'action': self.action,
            'data': self.data,
        }).encode('utf-8')).decode('utf-8')
