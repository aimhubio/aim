import os
import json
from copy import deepcopy
from functools import reduce

from sqlalchemy import exc
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import insert

from aim.engine.configs import AIM_FLASK_ENV_KEY
from aim.web.app.db import db
from aim.web.app.commits.models import Commit
from aim.web.app.config import config


def upgrade_runs_table(project, modified_runs):
    runs_hashes = [run_hash
                   for runs in modified_runs.values()
                   for run_hash, _ in runs]

    runs_models = Commit.query.filter(Commit.hash.in_(runs_hashes)).all()

    env = os.environ.get(AIM_FLASK_ENV_KEY, 'dev')
    session = sessionmaker(bind=engine_from_config({
        'db.echo': config[env].SQLALCHEMY_ECHO,
        'db.url': config[env].SQLALCHEMY_DATABASE_URI,
    }, prefix='db.'))
    additions_session = session()

    for experiment, runs in modified_runs.items():
        for run_hash, run_modified_time in runs:
            for run_model in runs_models:
                if run_model.hash == run_hash:
                    break
            else:
                run_model = None

            run_config = project.get_run_config(experiment, run_hash)
            started_at = finished_at = None
            if run_config is not None:
                process = run_config.get('process') or {}
                started_at, finished_at = (process.get('start_date'),
                                           process.get('finish_date'))

            if run_model is not None:
                if started_at:
                    run_model.session_started_at = started_at
                if finished_at:
                    run_model.session_closed_at = finished_at
            else:
                run_model = Commit(run_hash, experiment)

                # values = {
                #     'uuid': Commit.generate_uuid(),
                #     'hash': run_hash,
                #     'experiment_name': experiment,
                # }
                # if started_at:
                #     values['session_started_at'] = started_at
                # if finished_at:
                #     values['session_closed_at'] = finished_at
                #
                # insert_stmt = insert(Commit)
                # insert_stmt.values([values])

                if started_at:
                    run_model.session_started_at = started_at
                if finished_at:
                    run_model.session_closed_at = finished_at

                additions_session.begin_nested()
                try:
                    # additions_session.execute(insert_stmt)
                    additions_session.add(run_model)
                    additions_session.commit()
                except exc.IntegrityError:
                    additions_session.rollback()

    additions_session.commit()
    db.session.commit()


def get_branch_commits(branch_path):
    commits = {}
    for c in os.listdir(branch_path):
        if os.path.isdir(os.path.join(branch_path, c)) and c != 'index':
            commit_config_file_path = os.path.join(branch_path, c,
                                                   'config.json')
            try:
                with open(commit_config_file_path, 'r') as commit_config_file:
                    commit_config = json.loads(commit_config_file.read())
            except:
                commit_config = {}
            commits[c] = commit_config
    return commits


def deep_merge(*dicts, update=False):
    def merge_into(d1, d2):
        for key in d2:
            if key not in d1 or not isinstance(d1[key], dict):
                d1[key] = deepcopy(d2[key])
            else:
                d1[key] = merge_into(d1[key], d2[key])
        return d1

    if update:
        return reduce(merge_into, dicts[1:], dicts[0])
    else:
        return reduce(merge_into, dicts, {})


def dump_dict_values(item, dump_to):
    for k, v in item.items():
        if isinstance(v, dict) and len(v):
            dump_dict_values(v, dump_to)
        else:
            item[k] = dump_to
