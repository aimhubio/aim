from abc import ABCMeta
import time

from aim.sdk.artifacts import Record
from aim.sdk.artifacts.artifact import Artifact


class Text(Artifact, metaclass=ABCMeta):
    cat = ('text',)
    _step_counter = {}

    def __init__(self, document_name: str, text: str):
        self.document_name = document_name
        self.text = text
        self.timestamp = int(time.time())

        super(Text, self).__init__(self.cat)

    def __str__(self):
        return '{document_name}: {text}'.format(
            document_name=self.document_name, text=self.text)

    def serialize(self) -> Record:
        content = {"text": self.text, "timestamp": self.timestamp}

        return Record(
            name=self.document_name,
            cat=self.cat,
            content=content
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
