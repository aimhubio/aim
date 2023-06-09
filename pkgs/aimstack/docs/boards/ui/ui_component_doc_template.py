header = session_state.get('header', None)

description = session_state.get('description', None)

signature = session_state.get('signature', None)

parameters = session_state.get('parameters', None)

returns = session_state.get('returns', None)

example = session_state.get('example', None)

renderer = session_state.get('renderer', None)

if header is not None:
    ui.header(header)

if description is not None:
    ui.text(description)

if signature is not None:
    ui.subheader('Signature')
    ui.code(signature)

if parameters is not None:
    ui.subheader('Parameters')
    ui.table(parameters)

if returns is not None:
    ui.subheader('Returns')
    ui.table(returns)

if example is not None:
    ui.subheader('Example')
    ui.code(example)

if renderer is not None:
    ui.subheader('Result')
    renderer()
