import time

import math

from aim.engine.aim_repo import AimRepo
from aim.engine.utils import random_str
from aim.sdk.artifacts.artifact import Artifact
from aim.sdk.artifacts.record import Record, RecordCollection

Writable = [Record, RecordCollection]


class ArtifactWriter:
    def __init__(self):
        ...

    def save(self, repo: AimRepo, artifact: Artifact) -> bool:
        """
        Stores serialized instance into .aim repo
        """
        item = artifact.serialize()
        res = None

        if isinstance(item, Record):
            res = ArtifactWriter._save_record(repo, artifact, item)
        elif isinstance(item, RecordCollection):
            dir_path, dir_rel_path = repo.store_dir(item.name,
                                                    item.cat,
                                                    item.data)
            res = []
            for record in item.records:
                # Store dir files
                res.append(ArtifactWriter._save_record(repo, artifact, record, dir_rel_path))

        # Save dict
        return res

    @staticmethod
    def store_file(repo: AimRepo, record: Record, dir_path: str = None) -> dict:
        file_name = '{n}.{e}'.format(n=record.name,
                                     e=Artifact.LOG_EXT)
        write_mode = 'w' if record.is_singular else 'a'

        res = repo.store_file(file_name,
                              Artifact.LOG_EXT,
                              record.name,
                              record.cat,
                              record.content,
                              write_mode,
                              record.data,
                              dir_path)
        return res

    @staticmethod
    def _save_record(repo: AimRepo, artifact: Artifact, record: Record, dir_path: str = None):
        if record.binary_type is Artifact.IMAGE:
            # Get image name and abs path
            img_name_time = math.floor(time.time() * 1000)
            img_name_random = random_str(10)
            img_name = '{time}__{random}.jpg'.format(
                time=img_name_time,
                random=img_name_random)
            res = repo.store_image(img_name, record.cat)

            # Save image at specified path
            artifact.save_blobs(res['path'], res['abs_path'])
        elif record.binary_type == Artifact.MODEL:
            # Get model name, directory and zip archive paths
            file_res = repo.store_model_file(record.name,
                                             record.cat)

            # Save model at specified path
            model_save_res = artifact.save_blobs(file_res)

            res = repo.store_model(record.name,
                                   record.data['model_name'],
                                   record.data['epoch'],
                                   record.data['meta'],
                                   model_save_res,
                                   record.cat)

            # Archive model directory
            repo.archive_dir(res['zip_path'], res['dir_path'])
        else:
            res = ArtifactWriter.store_file(repo, record, dir_path)

        return res
