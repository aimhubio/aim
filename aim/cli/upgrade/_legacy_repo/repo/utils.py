import os

from aim.cli.upgrade._legacy_repo.configs import AIM_OBJECTS_DIR_NAME, AIM_COMMIT_META_FILE_NAME


def get_experiment_path(repo_path: str, experiment_name: str) -> str:
    return os.path.join(repo_path, experiment_name)


def get_experiment_run_path(repo_path: str, experiment_name: str,
                            run_hash: str) -> str:
    path = os.path.join(get_experiment_path(repo_path, experiment_name),
                        run_hash)
    return path


def get_run_objects_dir_path(repo_path: str, experiment_name: str,
                             run_hash: str) -> str:
    """Returns path of `objects` directory of a run"""
    path = os.path.join(repo_path,
                        experiment_name,
                        run_hash,
                        AIM_OBJECTS_DIR_NAME)
    return path


def get_run_objects_meta_file_path(repo_path: str, experiment_name: str,
                                   run_hash: str) -> str:
    """Returns path of `meta.json` file of a run"""
    path = os.path.join(get_run_objects_dir_path(repo_path, experiment_name,
                                                 run_hash),
                        AIM_COMMIT_META_FILE_NAME)
    return path
