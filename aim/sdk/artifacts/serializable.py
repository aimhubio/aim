import math
import time
from abc import ABCMeta, abstractmethod

from aim.engine.aim_repo import AimRepo
from aim.engine.utils import random_str


class Serializable(metaclass=ABCMeta):
    """
    Base class for all serializable artifacts
    """
    # List of types in which passed serialized content can be saved
    JSON_FILE = 'json_file'
    DIR = 'dir'
    IMAGE = 'image'
    MODEL = 'model'

    # List of different modes of storing serialized content to a file
    CONTENT_MODE_WRITE = 'w'
    CONTENT_MODE_APPEND = 'a'

    def __init__(self, cat: tuple):
        self.cat = cat

    @abstractmethod
    def serialize(self) -> dict:
        """
        Serializes instance to a dict and describes
        files, directories and/or archives that should be created
        to store an instance into .aim repo
        """
        ...

    @staticmethod
    def store_json(repo, content, dir_path=None) -> dict:
        file_name = '{}.json'.format(content['name'])
        data = content['data'] if 'data' in content else {}

        res = repo.store_file(file_name,
                              content['cat'],
                              content['content'],
                              content['mode'],
                              data,
                              dir_path)
        return res

    def save(self, repo: AimRepo) -> bool:
        """
        Stores serialized instance into .aim repo
        """
        serialized_inst = self.serialize()

        res = None
        for stored_obj, content in list(serialized_inst.items()):
            if stored_obj == self.JSON_FILE:
                # Store artifact inside json file
                res = self.store_json(repo, content)
            elif stored_obj == self.DIR:
                dir_path, dir_rel_path = repo.store_dir(content['name'],
                                                        content['data'])
                res = []
                for f in content['files']:
                    # Store dir files
                    for _, f_content in f.items():
                        res.append(self.store_json(repo,
                                                   f_content,
                                                   dir_rel_path))
            elif stored_obj == self.IMAGE:
                # Get image name and abs path
                img_name_time = math.floor(time.time() * 1000)
                img_name_random = random_str(10)
                img_name = '{time}__{random}.jpg'.format(
                    time=img_name_time,
                    random=img_name_random)
                res = repo.store_image(img_name, content['cat'])

                # Save image at specified path
                self.save_media(res['path'], res['abs_path'])
            elif stored_obj == self.MODEL:
                # Get model name, directory and zip archive paths
                file_res = repo.store_model_file(content['name'],
                                                 content['cat'])

                # Save model at specified path
                model_save_res = self.save_model(file_res)

                res = repo.store_model(content['name'],
                                       content['data']['model_name'],
                                       content['data']['epoch'],
                                       content['data']['meta'],
                                       model_save_res,
                                       content['cat'])

                # Archive model directory
                repo.archive_dir(res['zip_path'], res['dir_path'])

        # Save dict
        return res
