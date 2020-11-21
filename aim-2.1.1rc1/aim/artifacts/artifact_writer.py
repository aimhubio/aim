import time
import math

from aim.engine.repo import AimRepo
from aim.engine.utils import random_str, archive_dir
from aim.artifacts.artifact import Artifact
from aim.artifacts.record import Record, RecordCollection
from aim.artifacts.record_writer import RecordWriter

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
                res.append(
                    ArtifactWriter._save_record(
                        repo, artifact, record, dir_rel_path))

        # Save dict
        return res

    @staticmethod
    def _save_record(
            repo: AimRepo,
            artifact: Artifact,
            record: Record,
            dir_path: str = None):
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
            archive_dir(res['zip_path'], res['dir_path'])
        elif record.binary_type == Artifact.PROTOBUF:
            writer_type = RecordWriter.AIMRECORDS_WRITER
            write_mode = 'w' if record.is_singular else 'a'
            writer = RecordWriter.get_writer(writer_type,
                                             repo.records_storage)
            writer.write(artifact.get_inst_unique_name(),
                         write_mode,
                         record.content,
                         record.context)
            res = repo.store_artifact(record.name,
                                      record.cat,
                                      record.data,
                                      writer_type,
                                      record.binary_type,
                                      record.context)
        else:
            if record.binary_type == Artifact.JSON:
                writer = RecordWriter.JSON_WRITER
            else:
                writer = RecordWriter.JSON_LOG_WRITER
            file_name = '{}.log'.format(record.name)
            res = repo.store_file(file_name,
                                  record.name,
                                  record.cat,
                                  record.data,
                                  dir_path)
            write_mode = 'w' if record.is_singular else 'a'
            writer = RecordWriter.get_writer(writer)
            writer.write(res['abs_path'], write_mode, record.content)

        return res
