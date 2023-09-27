from datetime import datetime

from langchain_debugger import Trace

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
    table_data = {}

    table_data['Trace'] = trace['hash']

    # Convert timestamp to readable date format
    date = datetime.utcfromtimestamp(trace.creation_time).strftime('%Y-%m-%d %H:%M:%S')
    table_data['Date'] = date

    # Format status, tools and chains
    tools = ', '.join(trace.get('used_tools', [])) or "N/A"
    table_data['Used Tools'] = tools
    chains = trace.get('executed_chains', [])
    table_data['Executed Chains'] = ', '.join(chains)

    # Display steps count, tokens and cost
    steps_count = trace.get('steps_count', 'N/A')
    tokens_count = trace.get('tokens_count', 'N/A')
    cost = trace.get('cost', 'N/A')

    table_data['Total Steps'] = steps_count
    table_data['Total Tokens'] = tokens_count
    table_data['Cost'] = '${}'.format(cost)

    table_data['Latest Inputs']= str(trace.get('latest_input', 'N/A'))
    table_data['Latest Outputs']= str(trace.get('latest_output', 'N/A'))

    # Convert the details dictionary to a table format
    res = {
        'Key': list(table_data.keys()),
        'Value': list(table_data.values())
    }

    return res


if trace:
    overview_tab, steps_tab, cost_tab = ui.tabs(('Overview', 'Steps', 'Cost'))
    with overview_tab:
        trace_details_table = display_trace_details(trace)
        ui.table(trace_details_table)
    with steps_tab:
        ui.board('steps.py', state={'container_hash': c_hash})
    with cost_tab:
        ui.board('cost.py', state={'container_hash': c_hash})
