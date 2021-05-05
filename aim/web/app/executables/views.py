import json

from flask import (
    abort,
    request,
    jsonify,
    Blueprint,
    make_response,
    send_from_directory,
)
from flask_restful import Api, Resource

from aim.web.app import App
from aim.web.services.executables.action import Action
from aim.web.app.executables.models import Executable, Process
from aim.web.app.db import db
from aim.web.app.executables.utils import execute_process, clear_form


executables_bp = Blueprint('executables', __name__)
executables_api = Api(executables_bp)


@executables_api.resource('/new')
class ExecutableCreateApi(Resource):
    def post(self):
        command_form = clear_form(request.form)

        if not command_form.get('script_path'):
            return make_response(jsonify({}), 403)

        if not command_form.get('name'):
            return make_response(jsonify({}), 403)

        if not command_form.get('working_dir'):
            return make_response(jsonify({}), 403)

        e = Executable(command_form.get('name'),
                       command_form.get('script_path'),
                       command_form.get('arguments'),
                       command_form.get('env_vars'),
                       command_form.get('interpreter_path'),
                       command_form.get('working_dir'),
                       command_form.get('aim_experiment'))
        db.session.add(e)
        db.session.commit()


@executables_api.resource('/list')
class ExecutableListApi(Resource):
    def get(self):
        execs = Executable.query.filter(Executable.is_archived.is_(False)) \
            .filter(Executable.is_hidden.isnot(True)) \
            .order_by(Executable.created_at.desc()) \
            .all()

        result = []
        for e in execs:
            result.append({
                'id': e.uuid,
                'name': e.name,
                'script_path': e.script_path,
                'arguments': e.arguments,
                'interpreter_path': e.interpreter_path,
                'working_dir': e.working_dir,
                'env_vars': e.env_vars,
                'aim_experiment': e.aim_experiment,
            })

        return jsonify(result)


@executables_api.resource('/execute')
class ExecutableExecuteApi(Resource):
    def post(self):
        return


@executables_api.resource('/running')
class ExecutableListRunningApi(Resource):
    def get(self):
        action = Action(Action.SELECT, {})

        result = []
        processes_res = App.executables_manager.add(action, 30)
        if processes_res is None or 'processes' not in processes_res:
            return result

        processes_res = json.loads(processes_res)
        for p in processes_res['processes']:
            result.append({
                'pid': p['pid'],
                'name': p['name'],
                'script_path': p['script_path'],
                'arguments': p['arguments'],
                'interpreter_path': p['interpreter_path'],
                'working_dir': p['working_dir'],
                'env_vars': p['env_vars'],
            })

        return result


@executables_api.resource('/kill/<pid>')
class ExecutableKillRunningApi(Resource):
    def get(self, pid):
        action = Action(Action.KILL, {
            'pid': pid,
        })

        App.executables_manager.add(action, 30)

        return {
            'pid': pid,
        }


@executables_api.resource('/<executable_id>')
class ExecutableApi(Resource):
    def get(self, executable_id):
        exec = Executable.query.filter(Executable.uuid == executable_id).first()
        if not exec:
            return make_response(jsonify({}), 404)

        processes_res = []
        processes = Process.query \
            .filter(Process.executable_id == executable_id) \
            .order_by(Process.created_at.desc()).all()

        for p in processes:
            processes_res.append({
                'id': p.uuid,
                'pid': p.pid,
                'arguments': p.arguments,
                'env_vars': p.env_vars,
            })

        return {
            'name': exec.name,
            'script_path': exec.script_path,
            'arguments': exec.arguments,
            'env_vars': exec.env_vars,
            'interpreter_path': exec.interpreter_path,
            'working_dir': exec.working_dir,
            'aim_experiment': exec.aim_experiment,
            'processes': processes_res,
            'is_hidden': exec.is_hidden,
        }

    def post(self, executable_id):
        exec = Executable.query.filter(Executable.uuid == executable_id).first()
        if not exec:
            return make_response(jsonify({}), 404)

        command_form = clear_form(request.form)

        if not command_form.get('script_path'):
            return make_response(jsonify({}), 403)

        if not command_form.get('name'):
            return make_response(jsonify({}), 403)

        if not command_form.get('working_dir'):
            return make_response(jsonify({}), 403)

        exec.name = command_form.get('name')
        exec.script_path = command_form.get('script_path')
        exec.arguments = command_form.get('arguments')
        exec.env_vars = command_form.get('env_vars')
        exec.interpreter_path = command_form.get('interpreter_path')
        exec.working_dir = command_form.get('working_dir')
        exec.aim_experiment = command_form.get('aim_experiment')
        db.session.commit()


@executables_api.resource('/<executable_id>/hide')
class HideExecutableApi(Resource):
    def post(self, executable_id):
        exec = Executable.query.filter(Executable.uuid == executable_id).first()
        if not exec:
            return make_response(jsonify({}), 404)

        command_form = request.form
        if not command_form.get('is_hidden'):
            return make_response(jsonify({}), 403)

        exec.is_hidden = command_form.get('is_hidden') == 'true'
        db.session.commit()


@executables_api.resource('/<executable_id>/execute')
class ExecutableExecuteTemplateApi(Resource):
    def get(self, executable_id):
        exec = Executable.query.filter(Executable.uuid == executable_id).first()
        if not exec:
            return make_response(jsonify({}), 404)

        process = Process(exec.uuid, 0,
                          exec.script_path,
                          exec.arguments,
                          exec.env_vars,
                          exec.interpreter_path,
                          exec.working_dir,
                          exec.aim_experiment)

        res = execute_process(exec.name,
                              exec.script_path,
                              exec.arguments,
                              exec.env_vars,
                              exec.interpreter_path,
                              exec.working_dir,
                              exec.aim_experiment,
                              process.uuid)

        res_json = json.loads(res)

        process.pid = res_json['pid']

        db.session.add(process)
        db.session.commit()

        return {
            'pid': res_json['pid'],
        }

    def post(self, executable_id):
        exec = Executable.query.filter(Executable.uuid == executable_id).first()
        if not exec:
            return make_response(jsonify({}), 404)

        command_form = clear_form(request.form)

        name = command_form.get('name') or exec.name
        script_path = command_form.get('script_path') or exec.script_path
        interpreter_path = command_form.get('interpreter_path') \
                           or exec.interpreter_path
        working_dir = command_form.get('working_dir') or exec.working_dir

        process = Process(exec.uuid, 0,
                          script_path,
                          command_form.get('arguments'),
                          command_form.get('env_vars'),
                          interpreter_path,
                          working_dir,
                          command_form.get('aim_experiment'))

        res = execute_process(name,
                              script_path,
                              command_form.get('arguments'),
                              command_form.get('env_vars'),
                              interpreter_path,
                              working_dir,
                              command_form.get('aim_experiment'),
                              process.uuid)

        res_json = json.loads(res)

        process.pid = res_json['pid']

        db.session.add(process)
        db.session.commit()

        return {
            'pid': res_json['pid'],
        }


@executables_api.resource('/process/<process_id>')
class ExecutableProcessApi(Resource):
    def get(self, process_id):
        proc = Process.query.filter(Process.uuid == process_id).first()
        if not proc:
            return make_response(jsonify({}), 404)

        exec = Executable.query.filter(Executable.uuid == proc.executable_id).first()
        if not exec:
            return make_response(jsonify({}), 404)

        return {
            'id': proc.uuid,
            'pid': proc.pid,
            'arguments': proc.arguments,
            'env_vars': proc.env_vars,
            'script_path': proc.script_path,
            'interpreter_path': proc.interpreter_path,
            'working_dir': proc.working_dir,
            'aim_experiment': proc.aim_experiment,
            'executable': {
                'id': exec.uuid,
                'name': exec.name,
            },
        }
