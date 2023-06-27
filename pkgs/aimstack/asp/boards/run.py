from asp import Run

if 'hash' in session_state:
    hash = session_state['hash']
else:
    hash = None

runs = Run.filter(f'c.hash=="{hash}"')

if runs:
    run = runs[0]
    ui.subheader(f'Run {run["hash"]}')
else:
    ui.subheader('No runs found')
