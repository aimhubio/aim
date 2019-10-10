import shutil
import os
import json
import time
import math
import zipfile

from aim.engine.configs import *
from aim.engine.utils import is_path_creatable, ls_dir, random_str
from aim.sdk.track.metric import Metric
from aim.sdk.track.media import Media, Image
from aim.sdk.save.model import Checkpoint, Model
from aim.sdk.track.annotation import Annotation


class AimRepo:
    @staticmethod
    def get_working_repo():
        """
        Searches for .aim repository in working directory
        and returns AimRepo object if exists
        """
        # Get working directory path
        working_dir = os.environ['PWD']

        # Try to find closest .aim repository
        repo_found = False
        while True:
            if len(working_dir) <= 1:
                break

            if os.path.exists(os.path.join(working_dir, AIM_REPO_NAME)):
                repo_found = True
                break
            else:
                working_dir = os.path.split(working_dir)[0]

        if not repo_found:
            return None

        return AimRepo(working_dir)

    def __init__(self, path):
        self.path = os.path.join(path, AIM_REPO_NAME)
        self.config_path = os.path.join(self.path, AIM_CONFIG_FILE_NAME)
        self.objects_dir_path = os.path.join(self.path, AIM_OBJECTS_DIR_NAME)
        self.media_dir_path = os.path.join(self.objects_dir_path,
                                           AIM_MEDIA_DIR_NAME)
        self._config = None

    @property
    def config(self):
        """
        Config property getter, loads config file if not already loaded and
        returns json object
        """
        if self._config is None:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
            self._config = config
        return self._config

    @config.setter
    def config(self, config):
        self._config = config

    def save_config(self):
        """
        Saves object config to config file
        """
        with open(self.config_path, 'w') as f:
            f.write(json.dumps(self._config))

    def get_project_name(self):
        """
        Returns project name from config file
        """
        config = self.config
        return config['project_name']

    def get_remote_url(self, remote_name):
        """
        Returns remote url specified by remote name
        """
        for i in self.config['remotes']:
            if i['name'] == remote_name:
                return i['url']
        return None

    def init(self):
        """
        Initializes empty Aim repository
        """
        # Check whether user has sufficient permissions
        if not is_path_creatable(self.path):
            return False

        # Create `.aim` repo and `objects` directory
        os.mkdir(self.path)
        os.mkdir(self.objects_dir_path)

        # Create `config` file and fill in default configs
        # pkg_name, _, _ = __name__.partition('.')
        # default_config_path = os.path.join('..', DEFAULT_CONFIG_PATH)
        # default_config = pkg_resources.resource_filename('engine',
        #                                                  default_config_path)
        #
        # with open(self.config_path, 'w') as config_file:
        #     with open(default_config, 'r') as default_config_file:
        #         for line in default_config_file:
        #             config_file.write(line)

        with open(self.config_path, 'w') as config_file:
            config_file.write(json.dumps({
                'remotes': [],
            }))

        return True

    def rm(self):
        """
        Removes Aim repository
        """
        shutil.rmtree(self.path)

    def exists(self):
        """
        Checks whether Aim repository is initialized
        """
        return os.path.exists(self.path)

    def ls_files(self):
        """
        Returns list containing repository files
        """
        return ls_dir([self.path])

    def get_object_root(self, obj_type):
        """
        Returns object's root directory
        """
        if obj_type == 'metric':
            return AIM_METRICS_DIR_NAME
        elif obj_type == 'image':
            return os.path.join(AIM_MEDIA_DIR_NAME, AIM_IMAGES_DIR_NAME)
        elif obj_type == 'annotation':
            return AIM_ANNOT_DIR_NAME
        elif obj_type == 'model':
            return AIM_MODELS_DIR_NAME
        elif obj_type == 'checkpoint':
            return AIM_MODELS_DIR_NAME

    def objects_push_val(self, name, val):
        """
        Appends new data to specified object
        """
        dir_path = os.path.join(self.objects_dir_path,
                                self.get_object_root('metric'))
        data_file_name = '{}.json'.format(name)
        data_file_path = os.path.join(dir_path, data_file_name)

        if not os.path.isdir(dir_path):
            # Create data file
            data_file_content = []
            os.makedirs(dir_path, exist_ok=True)
            data_file = open(data_file_path, 'w+')
        else:
            # Get object content
            data_file = open(data_file_path, 'r+')
            data_file_content = json.loads(data_file.read())

        # Update and close data file
        data_file_content.append(val)
        data_file.seek(0)
        data_file.truncate()
        data_file.write(json.dumps(data_file_content))
        data_file.close()

    def objects_push_image(self, img):
        """
        Stores image and appends path to meta.json
        """
        dir_name = AIM_IMAGES_DIR_NAME
        images_dir_path = os.path.join(self.media_dir_path, dir_name)

        # Get image path
        img_name_time = math.floor(time.time() * 1000)
        img_name_random = random_str(10)
        img_name = '{time}__{random}.jpg'.format(time=img_name_time,
                                                 random=img_name_random)
        img_path = os.path.join(images_dir_path, img_name)

        # Save image at specified path
        img.save(img_path)

        img_rel_path = os.path.join(AIM_MEDIA_DIR_NAME, AIM_IMAGES_DIR_NAME)

        return img_name, img_rel_path

    def objects_push_annotation(self, annotation_obj):
        """
        Stores annotated object and updates meta file
        """

        # Process annotated object
        annot_obj_name = annot_obj_dir = annot_obj_type = None
        if isinstance(annotation_obj.obj, Image):
            annot_obj_type = 'image'
            annot_obj_name, annot_obj_dir = \
                self.objects_push_image(annotation_obj.obj)

        # Get object directory
        obj_dir = os.path.join(self.objects_dir_path,
                               self.get_object_root('annotation'))

        file_name = '{}.json'.format(annotation_obj.name)
        data_file_path = os.path.join(obj_dir, file_name)

        if not os.path.isfile(data_file_path):
            # Create directory and file
            os.makedirs(obj_dir, exist_ok=True)
            data_file = open(data_file_path, 'w+')

            data_file_content = []
        else:
            # Read object data file
            data_file = open(data_file_path, 'r+')
            data_file_content = json.loads(data_file.read())

        # Save value for current step
        step_val = {
            'object_name': annot_obj_name,
            'object_path': annot_obj_dir,
            'object_type': annot_obj_type,
            'meta': annotation_obj.meta,
        }

        # Update and close data file
        data_file_content.append(step_val)
        data_file.seek(0)
        data_file.truncate()
        data_file.write(json.dumps(data_file_content))
        data_file.close()

    def objects_push_model(self, obj):
        """
        Saves a model to repository
        """
        root_path = os.path.join(self.objects_dir_path,
                                 self.get_object_root('model'))

        dir_name = obj.checkpoint_name
        dir_path = os.path.join(root_path, dir_name)
        model_file_name = 'model'
        model_file_path = os.path.join(dir_path,
                                       model_file_name)
        meta_file_path = os.path.join(dir_path, 'model.json')

        # Create directory
        os.makedirs(dir_path, exist_ok=True)

        # Save model
        model_save_meta = obj.save(model_file_path)

        # Create meta file
        meta_file_content = {
            'name': obj.name,
            'epoch': obj.epoch,
            'model': model_save_meta,
        }
        with open(meta_file_path, 'w+') as meta_file:
            meta_file.write(json.dumps(meta_file_content))

        # Archive root directory
        zip_name = '{}.aim'.format(dir_name)
        zip_path = os.path.join(root_path, zip_name)
        zip_file = zipfile.ZipFile(zip_path, 'w')
        with zip_file:
            # Writing each file one by one
            for file in ls_dir([dir_path]):
                zip_file.write(file, file[len(dir_path):])

        # Remove model directory
        shutil.rmtree(dir_path)

        return dir_name

    def objects_push(self, push_obj, step=None):
        """
        Pushes a new object to repository
        """
        meta_file_path = os.path.join(self.objects_dir_path, 'meta.json')
        if os.path.isfile(meta_file_path):
            meta_file = open(meta_file_path, 'r+')
            meta_file_content = json.loads(meta_file.read())
        else:
            os.makedirs(os.path.dirname(meta_file_path), exist_ok=True)
            meta_file = open(meta_file_path, 'w+')
            meta_file_content = {}

        obj_name = obj_type = ''
        obj_data = {}
        if isinstance(push_obj, Metric):
            self.objects_push_val(push_obj.name, push_obj.val)
            obj_name = push_obj.name
            obj_type = 'metric'
        elif isinstance(push_obj, Media):
            if isinstance(push_obj, Image):
                self.objects_push_image(push_obj)
                obj_name = push_obj.name
                obj_type = 'image'
        elif isinstance(push_obj, Annotation):
            self.objects_push_annotation(push_obj)
            obj_name = push_obj.name
            obj_type = 'annotation'
        elif isinstance(push_obj, Checkpoint):
            self.objects_push_model(push_obj)
            obj_name = push_obj.checkpoint_name
            obj_type = 'checkpoint'
            obj_data['model_name'] = push_obj.name
            obj_data['epoch'] = push_obj.epoch
            obj_data['meta'] = push_obj.meta
        else:
            raise ValueError('Undefined type')

        if obj_name not in meta_file_content:
            meta_file_content[obj_name] = {
                'name': obj_name,
                'data': obj_data,
                'type': obj_type,
                'data_path': self.get_object_root(obj_type),
            }

        # Update and close meta file
        meta_file.seek(0)
        meta_file.truncate()
        meta_file.write(json.dumps(meta_file_content))
        meta_file.close()

    def __str__(self):
        return self.path
