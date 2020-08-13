import os

from aim.engine.configs import *


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


def cat_to_dir(cat):
    """
    Finds file directory by it's  category
    """
    if cat[0] == 'metrics':
        return AIM_METRICS_DIR_NAME
    elif cat[0] == 'metric_groups':
        return AIM_METRIC_GR_DIR_NAME
    elif cat[0] == 'media':
        if cat[1] == 'images':
            return os.path.join(AIM_MEDIA_DIR_NAME, AIM_IMAGES_DIR_NAME)
    elif cat[0] == 'misclassification':
        return AIM_ANNOT_DIR_NAME
    elif cat[0] == 'segmentation':
        return AIM_SEG_DIR_NAME
    elif cat[0] == 'models':
        return AIM_MODELS_DIR_NAME
    elif cat[0] == 'correlation':
        return AIM_CORR_DIR_NAME
    elif cat[0] == 'hyperparameters':
        return AIM_PARAMS_DIR_NAME
    elif cat[0] == 'map':
        return AIM_MAP_DIR_NAME
    elif cat[0] == 'stats':
        return AIM_STATS_DIR_NAME
    elif cat[0] == 'text':
        return AIM_TEXT_DIR_NAME
