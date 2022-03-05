from dvc.repo import Repo
from aim.storage.object import CustomObject


@CustomObject.alias('dvc.metadata')
class DvcData(CustomObject):
    AIM_NAME = 'dvc.metadata'

    def __init__(self, url='.'):
        super().__init__()
        self.storage['dataset'] = {
            'source': 'dvc',
            'meta': self._get_dvc_tracked_files(url)
        }

    def _get_dvc_tracked_files(self, url):
        entries = Repo.ls(
            url,
            path=None,
            rev=None,
            recursive=False,
            dvc_only=False,
        )
        return [entry['path'] for entry in entries]
