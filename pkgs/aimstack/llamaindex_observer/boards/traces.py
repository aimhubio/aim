from llamaindex_observer import Trace
from datetime import datetime

ui.header('Traces')

form = ui.form('Search')
query = form.text_input(value='')
runs = Trace.filter(query)

# Sort traces by Date in DESC order globally
runs = sorted(runs, key=lambda trace: trace.get('date', 0), reverse=True)

@memoize
def get_table_data(data=[], page_size=10, page_num=1):
    table_data = {
        'Trace': [],
        'Date': [],
        'Status': [],
        'Total Steps': [],
        # 'Tokens': [],
        'Cost': [],
        # 'Prompts': [],
    }

    traces = data[(page_num - 1) * page_size:page_num * page_size]

    for trace in traces:
        table_data['Trace'].append(trace['hash'])

        # Convert timestamp to readable date format
        from datetime import datetime
        timestamp = trace.get('date')
        date = datetime.utcfromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S') if timestamp else 'N/A'
        table_data['Date'].append(date)

        # Display steps count and cost
        steps_count = trace.get('steps_count', 'N/A')
        cost = trace.get('cost', 'N/A')
        # tokens = trace.get('params', {}).get('tokens', 'N/A')
        table_data['Total Steps'].append(steps_count)
        table_data['Cost'].append(cost)
        # table_data['Tokens'].append(tokens)

        # initial_prompts = ' '.join(trace.get('params', {}).get('initial_prompts', []))
        # table_data['Prompts'].append(initial_prompts)
        #
        # # Visualize only message_content key for generations
        # message_contents = [gen_info.get('message_content', 'N/A') for gen_info in trace.get('params', {}).get('final_generations', [])]
        # final_generations = ' | '.join(message_contents)
        # table_data['Generations'].append(final_generations)

    return table_data

row1, row2 = ui.rows(2)

with row1:
    items_per_page = ui.select(
        'Items per page', options=('5', '10', '50', '100'), index=1)
    page_num = ui.number_input(
        'Page', value=1, min=1, max=int(len(runs) / int(items_per_page)) + 1)


row2.table(get_table_data(runs, int(items_per_page), page_num), {
    'Trace': lambda val: ui.board_link('trace.py', val, state={'container_hash': val}),
    # 'Prompts': lambda val: ui.code(val),
})