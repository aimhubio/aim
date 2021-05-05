import uuid

from aim.web.app.db import db
from aim.web.app.utils import default_created_at


class Executable(db.Model):
    __tablename__ = 'executables'

    uuid = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, default='')
    script_path = db.Column(db.Text)
    arguments = db.Column(db.Text, default='')
    env_vars = db.Column(db.Text, default='')
    interpreter_path = db.Column(db.Text, default='')
    working_dir = db.Column(db.Text, default='')
    aim_experiment = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime,  default=default_created_at)
    is_archived = db.Column(db.Boolean)
    is_hidden = db.Column(db.Boolean, default=False)

    def __init__(self, name, script_path, arguments=None, env_vars=None,
                 interpreter_path=None, working_dir=None, aim_experiment=None):
        self.name = name
        self.script_path = script_path
        self.arguments = arguments
        self.env_vars = env_vars
        self.interpreter_path = interpreter_path
        self.working_dir = working_dir
        self.aim_experiment = aim_experiment
        self.uuid = str(uuid.uuid1())
        self.is_archived = False
        self.is_hidden = False


class Process(db.Model):
    __tablename__ = 'processes'

    uuid = db.Column(db.Text, primary_key=True)
    pid = db.Column(db.Text, default='')
    script_path = db.Column(db.Text, default='')
    arguments = db.Column(db.Text, default='')
    env_vars = db.Column(db.Text, default='')
    interpreter_path = db.Column(db.Text, default='')
    working_dir = db.Column(db.Text, default='')
    aim_experiment = db.Column(db.Text, default='')
    executable_id = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime,  default=default_created_at)
    is_archived = db.Column(db.Boolean)

    def __init__(self, executable_id, pid, script_path=None, arguments=None,
                 env_vars=None, interpreter_path=None, working_dir=None,
                 aim_experiment=None):
        self.uuid = str(uuid.uuid1())
        self.executable_id = executable_id
        self.pid = pid
        self.script_path = script_path
        self.arguments = arguments
        self.env_vars = env_vars
        self.interpreter_path = interpreter_path
        self.working_dir = working_dir
        self.aim_experiment = aim_experiment
        self.is_archived = False
