from typing import Any

from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.artifact import Record
from aim.sdk.artifacts.media import Media


class Misclassification(Artifact):
    cat = ('misclassification',)

    def __init__(self, name: str, obj: Media, label: Any, meta_label: Any):
        self.name = name
        self.obj = obj
        self.label = str(label)
        self.meta_label = str(meta_label)

        super(Misclassification, self).__init__(self.cat)

    def serialize(self):
        content = {
            'cat': self.obj.cat[-1],
            'path': self.obj.path,
            'data': {
                'label': self.label,
                'meta_label': self.meta_label,
            }
        }

        return Record(
            name=self.name,
            cat=self.cat,
            content=content,
        )

    def save_blobs(self, name: str, abs_path: str = None):
        pass
