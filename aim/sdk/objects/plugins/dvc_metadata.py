from aim.storage.object import CustomObject


@CustomObject.alias('dvc.metadata')
class DvcData(CustomObject):
    """
    Wrapper over DVC's LIST interface.
    Find DVC tracked files and stores the list into aim storage.
    """
    AIM_NAME = 'dvc.metadata'

    def __init__(self, url='.', path=None, rev=None, recursive=False, dvc_only=False):
        """
        Please refer to DVC reference for kwarg definitions.

        If 'url' is not defined, current dir will be used as DVC directory.
        """

        super().__init__()
        self.storage['dataset'] = {
            'source': 'dvc',
            'tracked_files': self._get_dvc_tracked_files(
                **dict(
                    url=url,
                    path=path,
                    rev=rev,
                    recursive=recursive,
                    dvc_only=dvc_only
                )
            )
        }

    def _get_dvc_tracked_files(self, **ls_kwargs):
        try:
            from dvc.repo import Repo
        except ImportError:
            raise RuntimeError(
                'Could not import module dvc.'
            )

        entries = Repo.ls(**ls_kwargs)
        return [entry['path'] for entry in entries]
