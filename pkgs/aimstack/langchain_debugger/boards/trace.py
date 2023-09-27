# This board is going to be updated after UI-side data processing refactoring
from langchain_debugger import Trace
from langchain_debugger import StepSequence

c_hash = session_state.get('container_hash')

if c_hash is None:
    ui.subheader('No trace selected')
    ui.board_link('traces.py', 'Explore traces')
    trace = None
else:
    trace = Trace.find(c_hash)
    if trace:
        hash = trace.get('hash')
        ui.header(f'Trace: {hash}')
    else:
        ui.subheader('Trace not found')
        ui.board_link('traces.py', 'Explore traces')


@memoize
def flatten(dictionary, parent_key='', separator='.'):
    flattened = {}
    for key, value in dictionary.items():
        new_key = f"{parent_key}{separator}{key}" if parent_key else key
        if isinstance(value, dict):
            flattened.update(flatten(value, new_key, separator=separator))
        else:
            flattened[new_key] = value
    return flattened


@memoize
def merge_dicts(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict

@memoize
def display_trace_details(trace):
    from datetime import datetime

    # Extract and format the required data from the trace
    details = {
        'Trace': trace.get('hash', 'N/A'),
        'Date': datetime.utcfromtimestamp(trace.get('params', {}).get('date', 0)).strftime('%Y-%m-%d %H:%M:%S') if trace.get('params', {}).get('date') else 'N/A',
        'Status': 'Exception' if '_Exception' in ', '.join(trace.get('params', {}).get('used_tools', [])) else 'Success',
        'Used Tools': ', '.join(trace.get('params', {}).get('used_tools', [])) or "None",
        'Executed Chains': ', '.join([chain.strip() for chain in trace.get('params', {}).get('executed_chains', '').strip('{}').split(',')]),
        'Total Steps': trace.get('params', {}).get('steps_count', 'N/A'),
        'Tokens': trace.get('params', {}).get('tokens', 'N/A'),
        'Cost': trace.get('params', {}).get('cost', 'N/A'),
        # 'Prompts': ' '.join(trace.get('params', {}).get('initial_prompts', []))
    }

    # Convert the details dictionary to a table format
    table_data = {
        'Key': list(details.keys()),
        'Value': list(details.values())
    }

    return table_data


if trace:
    overview_tab, steps_tab, cost_tab = ui.tabs(('Overview', 'Steps', 'Cost'))
    with overview_tab:
        trace_details_table = display_trace_details(trace)
        ui.table(trace_details_table)
    with steps_tab:
        ui.board('steps.py', state={'container_hash': c_hash})
    with cost_tab:
        ui.board('cost.py', state={'container_hash': c_hash})
