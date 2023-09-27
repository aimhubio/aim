from datetime import datetime

from llamaindex_observer import Trace

ui.header('Traces')

form = ui.form('Search')
query = form.text_input(value='')
runs = Trace.filter(query)

# Sort traces by Date in DESC order globally
runs = sorted(runs, key=lambda trace: trace.creation_time, reverse=True)

@memoize
def get_table_data(data=[], page_size=10, page_num=1):
    table_data = {
        'Trace': [],
        'Date': [],
        'Total Steps': [],
        'Total Tokens': [],
        'Cost': [],
        'Latest Query': [],
        'Latest Response': [],
    }

    traces = data[(page_num - 1) * page_size:page_num * page_size]

    for trace in traces:
        table_data['Trace'].append(trace['hash'])

        # Convert timestamp to readable date format
        date = datetime.utcfromtimestamp(trace.creation_time).strftime('%Y-%m-%d %H:%M:%S')
        table_data['Date'].append(date)

        # Display steps count, tokens and cost
        steps_count = trace.get('steps_count', 'N/A')
        tokens_count = trace.get('tokens_count', 'N/A')
        cost = trace.get('cost', 'N/A')

        table_data['Total Steps'].append(steps_count)
        table_data['Total Tokens'].append(tokens_count)
        table_data['Cost'].append('${}'.format(cost))

        # Display latest query and response
        latest_query = trace.get('latest_query', 'N/A')
        latest_response = trace.get('latest_response', 'N/A')

        table_data['Latest Query'].append(latest_query)
        table_data['Latest Response'].append(latest_response)

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