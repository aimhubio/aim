import shutil
import os
import json
import re
import time
import hashlib
import uuid
from typing import List, Optional, Union, Tuple

from aim.__version__ import __version__ as aim_version
from aim.engine.configs import *
from aim.engine.utils import (
    ls_dir,
    deep_compare,
    import_module,
    clean_repo_path,
    get_dict_item_by_path,
)
from aim.engine.profile import AimProfile
from aim.engine.repo.run import Run
from aim.engine.repo.dql.select import SelectResult
from aim.engine.repo.utils import (
    cat_to_dir,
    get_experiment_path,
    get_experiment_run_path,
    get_run_objects_dir_path,
    get_run_objects_meta_file_path,
)
from aim.ql.grammar import Expression
from aim.ql.tree import BinaryExpressionTree
from aim.ql.utils import build_bet


class AimRepo:
    # TODO: Refactor repo to have minimal side effects
    WRITING_MODE = 'w'
    READING_MODE = 'r'

    @staticmethod
    def get_working_repo(*args,
                         initialized_only=False,
                         **kwargs):
        """
        Searches for .aim repository in working directory
        and returns AimRepo object if exists
        """
        # Get working directory path
        working_dir = os.getcwd()

        # Try to find closest .aim repository
        repo_found = False
        while True:
            if len(working_dir) <= 1:
                break

            repo_path = os.path.join(working_dir, AIM_REPO_NAME)
            config_file_path = os.path.join(repo_path, AIM_CONFIG_FILE_NAME)

            if (not initialized_only and os.path.exists(repo_path)) \
                    or (initialized_only and os.path.isfile(config_file_path)):
                repo_found = True
                break
            else:
                working_dir = os.path.split(working_dir)[0]

        if not repo_found:
            return None

        return AimRepo(working_dir, *args, **kwargs)

    @staticmethod
    def generate_commit_hash():
        return str(uuid.uuid1())

    @staticmethod
    def get_artifact_cat(cat: tuple):
        if isinstance(cat, tuple):
            if len(cat) > 1:
                return cat
            elif len(cat) == 1:
                return cat[0]
        return None

    @classmethod
    def get_active_branch_if_exists(cls):
        repo = cls.get_working_repo(initialized_only=True)
        if repo is not None:
            return repo.branch
        return None

    def __init__(self, path=None, repo_branch=None,
                 repo_commit=None,
                 repo_full_path=None,
                 mode=WRITING_MODE):
        self._config = {}
        path = clean_repo_path(path)
        self.path = repo_full_path or os.path.join(path, AIM_REPO_NAME)
        self.config_path = os.path.join(self.path, AIM_CONFIG_FILE_NAME)
        self.hash = hashlib.md5(self.path.encode('utf-8')).hexdigest()

        self.active_commit = repo_commit or AIM_COMMIT_INDEX_DIR_NAME
        if re.match(r'^[A-Za-z0-9_\-]{2,}$', self.active_commit) is None:
            raise ValueError('run name must be at least 2 characters ' +
                             'and contain only latin letters, numbers, ' +
                             'dash and underscore')

        self.root_path = repo_full_path or path
        self.name = self.root_path.split(os.sep)[-1]

        self.branch_path = None
        self.index_path = None
        self.objects_dir_path = None
        self.media_dir_path = None
        self.records_storage = None
        self.mode = mode

        active_exp = self.config.get('active_branch')

        if repo_branch is not None:
            experiment = repo_branch
        elif active_exp is not None:
            experiment = active_exp
        else:
            experiment = None

        if experiment is not None:
            run_full_path = get_experiment_run_path(self.path,
                                                    experiment,
                                                    self.active_commit)
        else:
            run_full_path = None

        if self.active_commit != AIM_COMMIT_INDEX_DIR_NAME and run_full_path \
                and os.path.exists(run_full_path):
            raise ValueError(('run `{}` already exists' +
                              '').format(self.active_commit))

        if experiment is not None:
            self.branch = experiment

    def __str__(self):
        return self.path

    @property
    def config(self):
        """
        Config property getter, loads config file if not already loaded and
        returns json object
        """
        if len(self._config) == 0:
            if os.path.isfile(self.config_path):
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                self._config = config
        return self._config

    @config.setter
    def config(self, config):
        self._config = config

    @property
    def branch(self):
        return self._branch

    @branch.setter
    def branch(self, branch):
        self._branch = branch

        if self._branch not in self.list_branches():
            self.create_branch(self._branch)

        self.branch_path = get_experiment_path(self.path, self._branch)
        self.index_path = get_experiment_run_path(self.path, self._branch,
                                                  self.active_commit)
        self.objects_dir_path = get_run_objects_dir_path(self.path,
                                                         self._branch,
                                                         self.active_commit)
        self.media_dir_path = os.path.join(self.objects_dir_path,
                                           AIM_MEDIA_DIR_NAME)

        self.meta_file_content = None
        self.meta_file_path = get_run_objects_meta_file_path(self.path,
                                                             self._branch,
                                                             self.active_commit)

        if not os.path.isdir(self.index_path):
            os.makedirs(self.index_path)

        if self.records_storage:
            self.records_storage.close()

        if os.path.exists(self.branch_path):
            self.records_storage = self.get_records_storage(
                self.objects_dir_path,
                self.mode)

    def get_records_storage(self, path, mode):
        from aimrecords import Storage
        return Storage(path, mode)

    def close_records_storage(self):
        """
        Finalizes and closes records storage
        """
        if self.records_storage:
            self.records_storage.close()

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

    def init(self) -> bool:
        """
        Initializes new repository at the given path.
         - Creates .aim directory
         - Adds .aim/config.json file with initial configuration

        :returns: bool - True if repo was successfully initialized,
                         False otherwise;
        """
        # Return if repo exists and is initialized
        if self.is_initialized():
            return True

        try:
            # Create `.aim` repo
            os.makedirs(self.path, exist_ok=True)
        except:
            return False

        # Create config file
        with open(self.config_path, 'w') as config_file:
            config_file.write(json.dumps({
                'remotes': [],
                'branches': [],
                'active_branch': '',
            }))

        # self.create_logs()
        self.create_branch(AIM_DEFAULT_BRANCH_NAME)
        self.checkout_branch(AIM_DEFAULT_BRANCH_NAME)

        return True

    def rm(self):
        """
        Removes .aim directory recursively
        """
        shutil.rmtree(self.path)

    def exists(self):
        """
        Checks whether .aim repository is created
        """
        return os.path.exists(self.path)

    def is_initialized(self):
        """
        Checks whether .aim repository is initialized
        """
        return os.path.exists(self.path) and os.path.isfile(self.config_path)

    def ls_files(self):
        """
        Returns list of repository files
        """
        return ls_dir([self.path])

    def reconstruct_meta_file(self):
        """
        Reconstruct meta file(`Metric` and `NestedMap` artifacts)
        from tracked artifacts data.
        NOTE: Only can be needed in very specific cases.
        """
        meta_file_content = {}

        # Check if `NestedMap` were saved
        map_path = os.path.join(self.objects_dir_path, 'map', 'dictionary.log')
        if os.path.isfile(map_path):
            meta_file_content['dictionary.log'] = {
                'name': 'dictionary',
                'type': ['map', 'nested_map'],
                'data': None,
                'data_path': 'map',
            }

        # Collect metrics meta info
        metrics_info = self.records_storage.get_artifacts_names()
        for metric_name, context_items in metrics_info.items():
            meta_file_content[metric_name] = {
                'name': metric_name,
                'type': 'metrics',
                'data': None,
                'data_path': '__AIMRECORDS__',
                'format': {
                    'artifact_format': 'aimrecords',
                    'record_format': 'protobuf',
                },
                'context': [list(c.items()) for c in context_items],
            }
        return meta_file_content

    def load_meta_file(self, create_if_not_exist=True):
        if self.meta_file_content is None:
            if os.path.isfile(self.meta_file_path):
                with open(self.meta_file_path, 'r+') as meta_file:
                    self.meta_file_content = json.loads(meta_file.read())
            else:
                if not create_if_not_exist:
                    self.meta_file_content = {}
                    return

                os.makedirs(os.path.dirname(self.meta_file_path), exist_ok=True)
                self.meta_file_content = {}
                with open(self.meta_file_path, 'w+') as meta_file:
                    meta_file.write(json.dumps(self.meta_file_content))

    def update_meta_file(self, item_key, item_content, flush=1):
        """
        Updates run meta file.

        :param item_key: item key to insert or update
        :param item_content: item value
        :param flush: 0 not flush, 1 always flush, 2 flush on data update
        """
        self.load_meta_file()
        if flush == 0:
            self.meta_file_content[item_key] = item_content
        elif flush == 1:
            self.meta_file_content[item_key] = item_content
            self.flush_meta_file()
        elif flush == 2:
            updated = True
            if item_key not in self.meta_file_content.keys():
                # Item is not added to meta file yet
                self.meta_file_content[item_key] = item_content
            elif deep_compare(self.meta_file_content[item_key], item_content):
                # Item is outdated
                self.meta_file_content[item_key] = item_content
            else:
                updated = False
            if updated:
                self.flush_meta_file()

    def flush_meta_file(self, content=None):
        with open(self.meta_file_path, 'w+') as meta_file:
            meta_file.write(json.dumps(content or self.meta_file_content))

    def store_dir(self, name, cat, data={}):
        """
        Creates a new directory inside repo and returns it's relative path
        """
        # Create directory if not exists
        dir_rel_path = os.path.join(AIM_CORR_DIRS_NAME, name)
        dir_path = os.path.join(self.objects_dir_path,
                                dir_rel_path)

        if not os.path.isdir(dir_path):
            os.makedirs(dir_path, exist_ok=True)

        self.update_meta_file(name, {
            'name': name,
            'type': 'dir',
            'cat': cat,
            'data': data,
            'data_path': dir_rel_path,
        })

        return dir_path, dir_rel_path

    def store_file(self, file_name, name, cat, data={}, rel_dir_path=None):
        """
        Appends new data to the specified file or rewrites it
        and updates repo meta file
        """
        if not rel_dir_path:
            cat_path = cat_to_dir(cat)
        else:
            cat_path = rel_dir_path

        dir_path = os.path.join(self.objects_dir_path, cat_path)
        data_file_path = os.path.join(dir_path, file_name)

        # Create directory if not exists
        if not os.path.isdir(dir_path):
            os.makedirs(dir_path, exist_ok=True)

        # Update meta file
        if rel_dir_path is not None:
            file_name_for_meta = '{}/{}'.format(rel_dir_path, file_name)
        else:
            file_name_for_meta = file_name

        self.update_meta_file(file_name_for_meta, {
            'name': name,
            'type': self.get_artifact_cat(cat),
            'data': data,
            'data_path': cat_path,
        }, 2)

        return {
            'path': os.path.join(cat_path, file_name),
            'abs_path': data_file_path,
        }

    def store_artifact(self, name, cat, data, artifact_format=None,
                       binary_format=None, context=None):
        """
        Adds artifact info to the repo meta file
        """
        self.load_meta_file()

        flush = 0

        if name in self.meta_file_content.keys():
            artifact_value = self.meta_file_content[name]
        else:
            flush = 1
            artifact_value = {
                'name': name,
                'type': self.get_artifact_cat(cat),
                'data': data,
                'data_path': '__AIMRECORDS__',
                'format': {
                    'artifact_format': artifact_format,
                    'record_format': binary_format,
                },
                'context': [],
            }

        if context is not None:
            context_item = tuple(sorted(context.items()))
            if context_item not in artifact_value['context']:
                artifact_value['context'].append(context_item)
                flush = 1

        self.update_meta_file(name, artifact_value, flush)

        return {
            'name': name,
        }

    def store_image(self, name, cat, save_to_meta=False):
        """
        Returns saved object full path
        and updates repo meta file
        """
        images_dir_path = os.path.join(self.media_dir_path,
                                       AIM_IMAGES_DIR_NAME)

        img_rel_path = os.path.join(AIM_MEDIA_DIR_NAME,
                                    AIM_IMAGES_DIR_NAME)
        img_abs_path = os.path.join(images_dir_path, name)

        # Create image directory if not exists
        dir_path = os.path.dirname(img_abs_path)
        if not os.path.isdir(dir_path):
            os.makedirs(dir_path, exist_ok=True)

        # Update meta file
        if save_to_meta:
            self.update_meta_file(name, {
                'name': name,
                'type': self.get_artifact_cat(cat),
                'data': {},
                'data_path': img_rel_path,
            })

        return {
            'path': os.path.join(img_rel_path, name),
            'abs_path': img_abs_path,
        }

    def store_model_file(self, checkpoint_name, cat):
        """
        Saves a model file into repo
        """
        root_path = os.path.join(self.objects_dir_path,
                                 cat_to_dir(cat))

        dir_name = checkpoint_name
        dir_path = os.path.join(root_path, dir_name)
        model_file_name = 'model'
        model_file_path = os.path.join(dir_path,
                                       model_file_name)

        # Create directory
        os.makedirs(dir_path, exist_ok=True)

        return model_file_path

    def store_model(self, checkpoint_name, name, epoch,
                    meta_info, model_info, cat):
        """
        Saves a model into repo
        """
        root_path = os.path.join(self.objects_dir_path,
                                 cat_to_dir(cat))

        dir_name = checkpoint_name
        dir_path = os.path.join(root_path, dir_name)
        model_file_name = 'model'
        model_file_path = os.path.join(dir_path,
                                       model_file_name)
        meta_file_path = os.path.join(dir_path, 'model.json')

        # Create directory
        os.makedirs(dir_path, exist_ok=True)

        # Create meta file
        with open(meta_file_path, 'w+') as meta_file:
            meta_file.write(json.dumps({
                'name': name,
                'epoch': epoch,
                'model': model_info,
            }))

        zip_name = '{}.aim'.format(dir_name)
        zip_path = os.path.join(root_path, zip_name)

        # Update repo meta file
        self.update_meta_file(checkpoint_name, {
            'name': checkpoint_name,
            'type': self.get_artifact_cat(cat),
            'data': {
                'name': name,
                'epoch': epoch,
                'meta': meta_info,
                'model': model_info,
            },
            'data_path': dir_name,
        })

        return {
            'model_path': model_file_path,
            'dir_path': dir_path,
            'zip_path': zip_path,
        }

    def create_branch(self, branch: str):
        """
        Creates a new branch(aka experiment) - a sub-directory in .aim repo

        :param branch: branch name
        :type branch: str
        """
        dir_path = os.path.join(self.path, branch)

        if not re.match(r'^[A-Za-z0-9_\-]{2,}$', branch):
            raise AttributeError('experiment name must be at least ' +
                                 '2 characters and contain only latin ' +
                                 'letters, numbers, dash and underscore')

        # Save branch in repo config file
        branches = self.config.get('branches') or []
        for b in branches:
            if b.get('name') == branch:
                raise AttributeError('branch {} already exists'.format(branch))

        # Create branch directory
        objects_dir_path = os.path.join(dir_path,
                                        AIM_COMMIT_INDEX_DIR_NAME)
        os.makedirs(objects_dir_path)

        branches.append({
            'name': branch,
        })
        self.config['branches'] = branches
        self.save_config()

    def checkout_branch(self, branch: str):
        """
        Checkouts to the given branch.
        Sets the given branch name as `active_branch` in .aim/configs.json file.

        :raises:
            AttributeError: if branch does not exist
        """
        branches = self.config.get('branches') or []
        for b in branches:
            if branch == b.get('name'):
                self.config['active_branch'] = branch
                self.branch = branch
                self.save_config()
                return

        raise AttributeError('Experiment {} does not exist'.format(branch))

    def remove_branch(self, branch):
        """
        Removes specified branch:
         - recursively removes branch sub-directory from .aim repo
         - removes branch name from .aim/config.json file

        :raises:
            AttributeError: when attempting to delete the default branch
            AttributeError: if branch does not exist
        """
        if branch == AIM_DEFAULT_BRANCH_NAME:
            msg = '{} branch can not be deleted'.format(AIM_DEFAULT_BRANCH_NAME)
            raise AttributeError(msg)

        branches = self.config.get('branches')

        branch_exists = False
        for b in branches:
            if b.get('name') == branch:
                branch_exists = True
                break

        branch_dir_path = os.path.join(self.path, branch)

        if not branch_exists and not os.path.isdir(branch_dir_path):
            raise AttributeError('Experiment {} does not exist'.format(branch))

        # Remove branch
        self.config['branches'] = list(filter(lambda i: i.get('name') != branch,
                                              self.config['branches']))
        self.save_config()

        # Remove branch subdirectory
        if os.path.isdir(branch_dir_path):
            shutil.rmtree(branch_dir_path)

        # Set active branch to default if selected branch was active
        if self.branch == branch:
            self.checkout_branch(AIM_DEFAULT_BRANCH_NAME)

    def list_branches(self) -> list:
        """
        Returns list of existing branches
        """
        if self.config.get('branches') is None:
            return []

        return list(filter(lambda b: b != '',
                           map(lambda b: b.get('name') if b else '',
                               self.config.get('branches'))))

    def list_branch_commits(self, branch):
        """
        Returns list of specified branch commits
        """
        branch_path = os.path.join(self.path, branch.strip())

        commits = []

        if not os.path.isdir(branch_path):
            return commits

        for i in os.listdir(branch_path):
            if os.path.isdir(os.path.join(branch_path, i)) \
                    and i != AIM_COMMIT_INDEX_DIR_NAME:
                commits.append(i)
        return commits

    def is_index_empty(self):
        """
        Returns `True` if index directory is empty and
        `False` otherwise
        """
        return not len(ls_dir([self.index_path]))

    def get_latest_vc_branch(self):
        """
        Returns latest created branch name and hash
        """
        # Get commits
        commits = {}
        for c in os.listdir(self.branch_path):
            commit_path = os.path.join(self.branch_path, c)
            if os.path.isdir(commit_path) and c != AIM_COMMIT_INDEX_DIR_NAME:
                config_file_path = os.path.join(commit_path,
                                                AIM_COMMIT_CONFIG_FILE_NAME)
                with open(config_file_path, 'r') as config_file:
                    commits[c] = json.loads(config_file.read())

        # Find latest commit
        latest_commit = None
        for _, c in commits.items():
            if latest_commit is None or c['date'] > latest_commit['date']:
                latest_commit = c

        return latest_commit.get('vc') if latest_commit else None

    def run_exists(self, experiment_name: str, run_hash: str) -> bool:
        """Returns True if run exists, False otherwise"""
        return os.path.isdir(os.path.join(self.path, experiment_name, run_hash))

    def commit(self, commit_hash, commit_msg, vc_branch=None, vc_hash=None):
        """
        Moves current uncommitted artefacts temporary storage(aka `index`)
        to commit directory and re-initializes `index`
        """
        index_dir = self.index_path

        # Commit dir name is same as commit hash
        commit_dir = os.path.join(self.branch_path,
                                  commit_hash)

        # Move index to commit dir
        shutil.move(index_dir, commit_dir)

        # Init new index
        os.makedirs(index_dir)

        # Create commit config file
        config_file_path = os.path.join(commit_dir,
                                        AIM_COMMIT_CONFIG_FILE_NAME)
        with open(config_file_path, 'w+') as config_file:
            configs = {
                'hash': commit_hash,
                'date': int(time.time()),
                'message': commit_msg,
                'aim': {
                    'version': aim_version,
                },
            }

            profile = AimProfile()
            username = profile.get_username()
            if username:
                configs['user'] = {
                    'username': username,
                }

            if vc_branch and vc_hash:
                configs['vc'] = {
                    'system': 'git',
                    'branch': vc_branch,
                    'hash': vc_hash,
                }

            config_file.write(json.dumps(configs))

        return {
            'branch': self.config.get('active_branch'),
            'commit': commit_hash,
        }

    def commit_init(self):
        index_dir = self.index_path
        if not os.path.isdir(index_dir):
            os.makedirs(index_dir, exist_ok=True)

        # Create commit config file
        config_file_path = os.path.join(index_dir,
                                        AIM_COMMIT_CONFIG_FILE_NAME)
        curr_timestamp = int(time.time())
        with open(config_file_path, 'w+') as config_file:
            configs = {
                'hash': self.active_commit,
                'date': curr_timestamp,
                'message': curr_timestamp,
                'archived': False,
                'process': {
                    'start': True,
                    'finish': False,
                    'start_date': curr_timestamp,
                    'finish_date': 0,
                    'uuid': os.getenv(AIM_PROCESS_ENV_VAR),
                },
                'aim': {
                    'version': aim_version,
                },
            }
            config_file.write(json.dumps(configs))

        return True

    def get_run_config(self):
        config_file_path = os.path.join(self.index_path,
                                        AIM_COMMIT_CONFIG_FILE_NAME)

        if not os.path.isfile(config_file_path):
            return None

        with open(config_file_path, 'r+') as config_file:
            try:
                configs = json.loads(config_file.read())
            except:
                configs = None

        return configs

    def is_run_finished(self) -> Optional[bool]:
        """
        Returns True if run is finished, False otherwise
        """
        run_config = self.get_run_config()
        process = run_config.get('process') or {}
        return process.get('finish')

    def commit_finish(self):
        index_dir = self.index_path
        config_file_path = os.path.join(index_dir,
                                        AIM_COMMIT_CONFIG_FILE_NAME)

        configs = self.get_run_config() or {}

        curr_timestamp = int(time.time())
        configs['date'] = curr_timestamp
        configs['message'] = curr_timestamp
        configs['process']['finish'] = True
        configs['process']['finish_date'] = curr_timestamp
        with open(config_file_path, 'w+') as config_file:
            config_file.write(json.dumps(configs))

        return True

    def reset_index(self):
        """
        Removes all files inside repo's index dir
        """
        index_dir = self.index_path

        # List all files inside index
        for filename in os.listdir(index_dir):
            file_path = os.path.join(index_dir, filename)

            # Delete files, links and dirs
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)

    def get_index_meta(self):
        """
        Returns parsed meta file of index or `False` if file does not exist
        """
        meta_file_path = os.path.join(self.objects_dir_path,
                                      AIM_COMMIT_META_FILE_NAME)

        if not os.path.isfile(meta_file_path):
            return False

        with open(meta_file_path, 'r') as meta_file:
            meta_file_content = json.load(meta_file)

        return meta_file_content

    def is_archived(self, experiment_name: str,
                    run_hash: str) -> Optional[bool]:
        """Checks if the given run is archived"""
        run_dir_path = get_experiment_run_path(self.path, experiment_name,
                                               run_hash)
        config_file_path = os.path.join(run_dir_path,
                                        AIM_COMMIT_CONFIG_FILE_NAME)

        if not os.path.exists(config_file_path):
            return None

        with open(config_file_path, 'r') as config_file:
            try:
                config = json.loads(config_file.read())
            except:
                return None

        return config.get('archived')

    def archive(self, experiment_name: str, run_hash: str) -> bool:
        """Archives the given run"""
        return self._toggle_archive_flag(experiment_name, run_hash, True)

    def unarchive(self, experiment_name: str, run_hash: str) -> bool:
        """Unarchives the given run"""
        return self._toggle_archive_flag(experiment_name, run_hash, False)

    def _toggle_archive_flag(self, experiment_name: str,
                             run_hash: str, flag: bool) -> bool:
        run_dir_path = get_experiment_run_path(self.path, experiment_name,
                                               run_hash)
        config_file_path = os.path.join(run_dir_path,
                                        AIM_COMMIT_CONFIG_FILE_NAME)

        with open(config_file_path, 'r') as config_file:
            try:
                config = json.loads(config_file.read())
            except:
                return False

        config['archived'] = flag

        with open(config_file_path, 'w') as config_file:
            try:
                config_file.write(json.dumps(config))
            except:
                return False

        return True

    def save_diff(self, diff):
        """
        Saves diff to the repo
        """
        diff_dir_path = os.path.join(self.objects_dir_path,
                                     AIM_DIFF_DIR_NAME)
        diff_file_path = os.path.join(diff_dir_path,
                                      AIM_DIFF_FILE_NAME)

        # Create `diff` directory
        os.makedirs(diff_dir_path, exist_ok=True)

        # Write diff content to the `diff` file
        with open(diff_file_path, 'w+') as diff_file:
            diff_file.write(diff)

    def ls_branch_files(self, branch):
        """
        Returns list of files of the specified branch
        """
        branch_path = os.path.join(self.path, branch)
        return ls_dir([branch_path])

    def ls_commit_files(self, branch, commit):
        """
        Returns list of files of the specified commit
        """
        commit_path = os.path.join(self.path, branch, commit)
        return ls_dir([commit_path])

    def select(self,
               select_fields: List[str] = [],
               expression: Optional[
                       Union[str,
                             Expression,
                             BinaryExpressionTree]] = None,
               default_expression: Optional[
                       Union[str,
                             Expression,
                             BinaryExpressionTree]] = None,
               ):
        select_result = SelectResult(select_fields)

        runs = {
            exp_name: [
                Run(self, exp_name, run_hash)
                for run_hash in self.list_branch_commits(exp_name)
            ]
            for exp_name in self.list_branches()
        }

        # Build expression tree
        if expression:
            expression = build_bet(expression)
            expression.strict = True

        if default_expression:
            default_expression = build_bet(default_expression)
            default_expression.strict = True
            if expression:
                expression.concat(default_expression)
            else:
                expression = default_expression

        for experiment_runs in runs.values():
            for run in experiment_runs:
                # Dictionary representing all search fields
                fields = {
                    'experiment': run.experiment_name,
                    'run': run.config,  # Run configs (date, name, archived etc)
                    'params': run.params,  # Run parameters (`NestedMap`)
                }
                # Default parameters - those passed without namespace
                default_params = {
                    'params': (run.params.get(AIM_NESTED_MAP_DEFAULT) or {}),
                }

                # Search metrics
                for metric_name, metric in run.get_all_metrics().items():
                    fields['metric'] = metric_name
                    for trace in metric.get_all_traces():
                        fields['context'] = trace.context
                        # Pass fields in descending order by priority
                        if expression is None:
                            res = True
                        else:
                            res = expression.match(fields,
                                                   run.params,
                                                   default_params)

                        if res is not True:
                            continue

                        # Append trace data if metric is selected
                        for select_field in select_fields:
                            if select_field == metric_name:
                                metric.append(trace)
                                run.add(metric)
                                break

                        # Append run if either metric or param is selected
                        for select_field in select_fields:
                            if select_field == metric_name:
                                select_result.append_run(run)
                                break

                            field_val = get_dict_item_by_path(run.params,
                                                              select_field)
                            if field_val is not None:
                                select_result.append_run(run)
                                break

        return select_result

    def select_runs(self,
                    expression: Optional[
                           Union[str,
                                 Expression,
                                 BinaryExpressionTree]] = None,
                    default_expression: Optional[
                           Union[str,
                                 Expression,
                                 BinaryExpressionTree]] = None,
                    ) -> List[Run]:
        runs = {
            exp_name: [
                Run(self, exp_name, run_hash)
                for run_hash in self.list_branch_commits(exp_name)
            ]
            for exp_name in self.list_branches()
        }

        matched_runs = []  # type: List[Run]

        # Build expression tree
        if expression:
            expression = build_bet(expression)
            expression.strict = True

        if default_expression:
            default_expression = build_bet(default_expression)
            default_expression.strict = True
            if expression:
                expression.concat(default_expression)
            else:
                expression = default_expression

        for experiment_runs in runs.values():
            for run in experiment_runs:
                # Add metrics path modifier
                expression.dump_path_modifiers()
                if AIM_MAP_METRICS_KEYWORD in run.params.keys():
                    expression.add_path_modifier(
                        lambda path_token: self.metrics_path_checker(
                            path_token,
                            run.config.keys()),
                        lambda path_token: self.metrics_path_modifier(
                            path_token,
                            run.params[AIM_MAP_METRICS_KEYWORD])
                    )

                # Dictionary representing all search fields
                fields = {
                    'experiment': run.experiment_name,
                    'run': run.config,  # Run configs (date, name, archived etc)
                    'params': run.params,  # Run parameters (`NestedMap`)
                }
                # Default parameters - ones passed without namespace
                default_params = run.params.get(AIM_NESTED_MAP_DEFAULT) or {}

                if not expression:
                    res = True
                else:
                    res = expression.match(fields,
                                           run.params,
                                           default_params)
                if res is True:
                    matched_runs.append(run)

        return matched_runs

    def select_metrics(self, select_metrics: Union[str, List[str], Tuple[str]],
                       expression: Optional[
                           Union[str,
                                 Expression,
                                 BinaryExpressionTree]] = None,
                       default_expression: Optional[
                           Union[str,
                                 Expression,
                                 BinaryExpressionTree]] = None,
                       ) -> List[Run]:
        """
        Searches repo and returns matching metrics
        """
        if isinstance(select_metrics, str):
            select_metrics = [select_metrics]

        runs = {
            exp_name: [
                Run(self, exp_name, run_hash)
                for run_hash in self.list_branch_commits(exp_name)
            ]
            for exp_name in self.list_branches()
        }

        matched_runs = []  # type: List[Run]

        expression = build_bet(expression)
        expression.strict = True
        if default_expression:
            default_expression = build_bet(default_expression)
            expression.concat(default_expression)

        for experiment_runs in runs.values():
            for run in experiment_runs:
                # Add metrics path modifier
                expression.dump_path_modifiers()
                if AIM_MAP_METRICS_KEYWORD in run.params.keys():
                    expression.add_path_modifier(
                        lambda path_token: self.metrics_path_checker(
                            path_token,
                            run.config.keys()),
                        lambda path_token: self.metrics_path_modifier(
                            path_token,
                            run.params[AIM_MAP_METRICS_KEYWORD])
                    )

                # Dictionary representing all search fields
                fields = {
                    'experiment': run.experiment_name,
                    'run': run.config,  # Run configs (date, name, archived etc)
                    'params': run.params,  # Run parameters (`NestedMap`)
                }
                # Default parameters - ones passed without namespace
                default_params = run.params.get(AIM_NESTED_MAP_DEFAULT) or {}

                # Search metrics
                for metric_name, metric in run.get_all_metrics().items():
                    if metric_name not in select_metrics:
                        continue

                    fields['metric'] = metric_name
                    for trace in metric.get_all_traces():
                        fields['context'] = trace.context
                        # Pass fields in descending order by priority
                        if expression is None:
                            res = True
                        else:
                            res = expression.match(fields,
                                                   run.params,
                                                   default_params)
                        if res is True:
                            metric.append(trace)
                            run.add(metric)
                            if run not in matched_runs:
                                matched_runs.append(run)

        return matched_runs

    @staticmethod
    def metrics_path_checker(path, run_fields: list) -> bool:
        path = str(path)
        if not path.startswith('run.'):
            return False

        identifiers = path.split('.')[1:]
        if len(identifiers) == 0 or identifiers[0] in run_fields:
            return False

        return True

    @staticmethod
    def metrics_path_modifier(path, metrics) -> Optional[bool]:
        path = str(path)

        if '.' not in path:
            return None

        identifiers = path.split('.')
        if len(identifiers) < 2:
            return None

        metric_name = identifiers[1]
        if len(identifiers) > 2 and identifiers[-1] in ('min', 'max', 'last'):
            value_field = identifiers[-1]
            identifiers = identifiers[:-1]
        else:
            value_field = 'last'

        context_identifiers = identifiers[2:]

        if metric_name not in metrics:
            return None

        metric_data = metrics[metric_name]
        for trace in metric_data:
            context_values = list(map(lambda c: c[1], trace['context']))
            if all(c in context_values for c in context_identifiers):
                return trace['values'][value_field]

        return None

    def select_run_metrics(self, experiment_name: str, run_hash: str,
                           select_metrics: Optional[
                               Union[str, List[str], Tuple[str]]
                           ] = None
                           ) -> Optional[Run]:
        if not self.run_exists(experiment_name, run_hash):
            return None

        if select_metrics is not None and isinstance(select_metrics, str):
            select_metrics = [select_metrics]

        run = Run(self, experiment_name, run_hash)
        for metric_name, metric in run.get_all_metrics().items():
            if select_metrics is None or metric_name in select_metrics:
                for trace in metric.get_all_traces():
                    metric.append(trace)
                    run.add(metric)
        return run

    def create_logs(self):
        """
        Creates the logs dir in .aim to store error and activity logs
        for cli and sdk respectively
        """
        logs_path = os.path.join(self.path, AIM_LOGGING_DIR_NAME)
        os.mkdir(logs_path)

    def get_logs_dir(self):
        return os.path.join(self.path, AIM_LOGGING_DIR_NAME)
