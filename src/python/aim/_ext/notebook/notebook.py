import shlex

import aim._ext.notebook.manager as manager

# Error message prefix for aim commands
ERROR_MSG_PREFIX = b'Error:'

# returned by get_execution_context
_COLAB_EXEC_CONTEXT = "_COLAB_EXEC_CONTEXT"
_IPYTHON_EXEC_CONTEXT = "_IPYTHON_EXEC_CONTEXT"
_OTHER_EXEC_CONTEXT = "_OTHER_EXEC_CONTEXT"

# current execution context
_CURRENT_CONTEXT = _OTHER_EXEC_CONTEXT

# environment specific constants
# useful for detecting the environment from the UI
_SAGE_MAKER_NOTEBOOK_PATH_POSTFIX = "/aim-sage"
_NOTEBOOK_PATH_POSTFIX = "/notebook"


def get_execution_context():
    """Determine the most specific context that we're in.
    Returns:
      _COLAB_EXEC_CONTEXT: If in Colab with an IPython notebook context.
      _IPYTHON_EXEC_CONTEXT: If we are in an IPython notebook
        context but not in colab (i.e. `jupyter notebook`)
        line).
      _OTHER_EXEC_CONTEXT: Otherwise (e.g., by running a Python script at the
        command-line or using the `ipython` interactive shell).
    """
    # In Colab, the `google.colab` module is available, but the shell
    # returned by `IPython.get_ipython` does not have a `get_trait`
    # method.

    # imports are dynamic, since some modules are not available for all contexts
    try:
        import IPython
    except ImportError:
        pass
    else:
        ipython = IPython.get_ipython()
        # @TODO find a stable way to get colab context
        if ipython is not None and 'google.colab' in str(ipython):
            # We are in Colab notebook context
            # global _CURRENT_CONTEXT
            # _CURRENT_CONTEXT = _COLAB_EXEC_CONTEXT
            return _COLAB_EXEC_CONTEXT

        # In an IPython command line shell or Jupyter notebook
        elif ipython is not None and ipython.has_trait("kernel"):
            # global _CURRENT_CONTEXT
            # _CURRENT_CONTEXT = _IPYTHON_EXEC_CONTEXT
            return _IPYTHON_EXEC_CONTEXT

    # Otherwise, we're not in a known notebook context.
    return _OTHER_EXEC_CONTEXT


def get_argument_options(line):
    """
        Returns parsed argument options and command from magic cell as  dict (command, options)
        currently parse only --<name>=value style to dict
        Set default values for the required fields, otherwise the provided fields
        Will omit unsupported args @TODO notify about unsupported args
        @TODO add process args all styles to dict
    """
    # @TODO improve this logic
    # --proxy-url is useful to print the right url, and set UI's url into iframe correctly
    supported_args = ['--port', '--host', '--repo', '--proxy-url']

    args = shlex.split(line)
    command = args[0]

    options = {
        '--host': '127.0.0.1',
        '--port': '43801',
        '--base-path': _NOTEBOOK_PATH_POSTFIX
    }
    for arg in args[1:]:
        key, value = arg.split('=', 1)
        if key in supported_args:
            options[key] = value
    # if --proxy-url passed
    if options.get('--proxy-url'):
        options['--base-path'] = f'/proxy/absolute/{options["--port"]}{_SAGE_MAKER_NOTEBOOK_PATH_POSTFIX}'

    return command, options


def display_colab(port, display):
    """Display Aim instance in a Colab output frame.
       It need go through the proxy
    """
    import IPython.display

    shell = """
        (async () => {{
            const url = new URL('{path}/', await google.colab.kernel.proxyPort({port}, {{'cache': true}}));
            const iframe = document.createElement('iframe');
            iframe.src = url;
            const a = document.createElement('a');
            a.href = url;
            a.innerHTML = 'Open in new browser tab';
            a.setAttribute('target', '_blank');

            iframe.setAttribute('width', '100%');
            iframe.setAttribute('height', '800');
            iframe.setAttribute('frameborder', 0);
            document.body.appendChild(iframe);
            document.body.appendChild(a);
        }})();
        """.format(path=_NOTEBOOK_PATH_POSTFIX, port=port)

    script = IPython.display.Javascript(shell)

    if display:
        display.update(script)
    else:
        IPython.display.display(script)


def display_notebook(host, port, display, proxy_url=None):
    """Display Aim instance in an ipython context output frame.
    """
    import IPython.display
    url = "{}:{}{}".format(host, port, _NOTEBOOK_PATH_POSTFIX)

    # @TODO add warning if proxy_url is not defined
    if proxy_url:
        # jupyter-server-proxy supports absolute paths by using it with /proxy/absolute/<port> path
        url = "{}{}{}{}/".format(proxy_url, '/proxy/absolute/', port, _SAGE_MAKER_NOTEBOOK_PATH_POSTFIX)
        print(url)

    shell = """
              <iframe id="aim" width="100%" height="800" frameborder="0" src={}>
              </iframe>
            """.format(url)

    iframe = IPython.display.HTML(shell)
    display.update(iframe)


def ui(options, context):
    """
        Calls to run `aim ui` command width corresponding arguments
        Handles the result of the command
        Renders the <iframe> tag for the notebook and message for the shell users
        The <iframe> renders width the corresponding way for different execution contexts (mainly for notebooks)
    """

    try:
        import IPython
        import IPython.display
    except ImportError:
        IPython = None

    display = None
    if context == _OTHER_EXEC_CONTEXT:
        print("Launching Aim ...")
    else:
        display = IPython.display.display(
            IPython.display.Pretty("Launching Aim ..."),
            display_id=True,
        )

    result = manager.run_up(options)

    if result.status == manager.ManagerActionStatuses.Failed:
        print(result.info["message"])
        return

    port = result.info["port"]
    host = result.info["host"]

    # successful exec of aim ui command
    if context == _COLAB_EXEC_CONTEXT:
        display_colab(port, display)
        return
    if context == _IPYTHON_EXEC_CONTEXT:
        display_notebook(host, port, display, options.get("--proxy-url"))
        return

    # other context
    print("Open {}:{}".format(host, port))


def version(options, context):
    """Handles aim version (get version process) and send to the ui"""
    result = manager.run_version(options)
    if result.status is manager.ManagerActionStatuses.Failed:
        print(result.info["message"])
    else:
        print("Aim v{}".format(result.info["version"]))


# Those are aim magic function available commands
# It is possible to add commands outside aim cli
handlers = {
    'ui': ui,
    'version': version
}


def execute_magic_aim(line):
    """ `aim` line magic function
        We are trying to keep similarity with the native aim cli commands as much as possible
    """
    context = get_execution_context()
    command, options = get_argument_options(line)
    # check command existence
    if command not in handlers:
        print('Invalid operation.')
        return

    # call corresponding handler
    handlers[command](options, context)


def load_ipython_extension(ipython):
    ipython.register_magic_function(execute_magic_aim, magic_kind="line", magic_name="aim")
