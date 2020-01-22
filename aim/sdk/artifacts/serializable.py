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
    LOG_FILE = 'log_file'
    DIR = 'dir'
    IMAGE = 'image'
    MODEL = 'model'

    # List of available file extensions
    JSON_EXT = 'json'
    LOG_EXT = 'log'

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
    def store_file(repo, ext, content, dir_path=None) -> dict:
        data = content['data'] if 'data' in content else {}
        file_name = '{n}.{e}'.format(n=content['name'],
                                     e=ext)

        res = repo.store_file(file_name,
                              ext,
                              content['name'],
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
                res = self.store_file(repo, self.JSON_EXT, content)
            elif stored_obj == self.LOG_FILE:
                # Store artifact as log file
                res = self.store_file(repo, self.LOG_EXT, content)
            elif stored_obj == self.DIR:
                dir_path, dir_rel_path = repo.store_dir(content['name'],
                                                        content['cat'],
                                                        content['data'])
                res = []
                for f in content['files']:
                    # Store dir files
                    for _, f_content in f.items():
                        res.append(self.store_file(repo,
                                                   # TODO: get ext from content
                                                   'log',
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
