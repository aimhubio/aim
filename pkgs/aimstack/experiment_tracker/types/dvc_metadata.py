import logging
from pathlib import Path
import yaml

from aim import Record

try:
    from dvc.repo import Repo
    import dvc.api as api
except ImportError:
    raise ImportError("module dvc could not be imported")


class DvcData(Record):
    """
    Wrapper over DVC's LIST interface.
    Find DVC tracked files and stores the list into aim storage.
    """
    AIM_NAME = 'dvc.Metadata'

    def __init__(self, url='.', path=None, rev=None, recursive=False, dvc_only=False):
        """
        Please refer to DVC reference for kwarg definitions.

        If 'url' is not defined, current dir will be used as DVC directory.
        """

        super().__init__()

        self.storage['dataset'] = {
            'source': 'dvc',
            'version': self._get_dvc_lock(url),
            'params': self._get_dvc_params(url),
            'tracked_files': self._get_dvc_tracked_files(
                **dict(
                    url=url,
                    path=path,
                    rev=rev,
                    recursive=recursive,
                    dvc_only=dvc_only
                )
            ),
        }

    def _get_dvc_tracked_files(self, **ls_kwargs):
        entries = Repo.ls(**ls_kwargs)
        return [entry['path'] for entry in entries]

    def _get_dvc_params(self, url):
        try:
            params = api.params_show(repo=url)
            return params
        except Exception:
            logging.warning("Failed to log params")

    def _get_dvc_lock(self, url):
        try:
            with open(Path(url).joinpath('dvc.lock'), 'r') as f:
                try:
                    content = yaml.safe_load(f)
                    return content
                except yaml.YAMLError as exc:
                    logging.warning(exc)
                content = f.readlines()
        except FileNotFoundError:
            logging.warning(f"Failed to find dvc.lock in the repo {url}")
