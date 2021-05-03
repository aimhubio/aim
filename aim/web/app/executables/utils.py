from aim.web.services.executables.action import Action
from aim.web.app import App


def execute_process(name, script_path, arguments=None, env_vars=None,
                    interpreter_path=None, working_dir=None,
                    aim_experiment=None, process_uuid=None):
    if aim_experiment:
        env_vars = ('{} __AIM_AUTOMATED_EXEC__=1 ' +
                    ' __AIM_BRANCH__={}').format(env_vars, aim_experiment)

    action = Action(Action.EXEC, {
        'name': name,
        'script_path': script_path,
        'arguments': arguments,
        'env_vars': env_vars,
        'interpreter_path': interpreter_path,
        'working_dir': working_dir,
        'process_uuid': process_uuid,
    })

    pid = App.executables_manager.add(action, 60)

    return pid


def clear_form(form):
    name = form.get('name') or ''
    name = name.strip()
    script_path = form.get('script_path') or ''
    script_path = script_path.strip()
    arguments = form.get('arguments') or ''
    arguments = arguments.strip()
    env_vars = form.get('env_vars') or ''
    env_vars = env_vars.strip()
    interpreter_path = form.get('interpreter_path') or ''
    interpreter_path = interpreter_path.strip()
    working_dir = form.get('working_dir') or ''
    working_dir = working_dir.strip()
    aim_experiment = form.get('aim_experiment') or ''
    aim_experiment = aim_experiment.strip()

    return {
        'name': name,
        'script_path': script_path,
        'arguments': arguments,
        'env_vars': env_vars,
        'interpreter_path': interpreter_path,
        'working_dir': working_dir,
        'aim_experiment': aim_experiment,
    }