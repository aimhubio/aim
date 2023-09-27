import math

from llamaindex_observer import StepSequence

def render_llama_action(action, action_idx):
    if not action:
        return

    # LlamaIndex specific event types
    EMBEDDING = 'embedding'
    LLM = 'llm'
    TEMPLATING = 'templating'
    RETRIEVE = 'retrieve'
    SYNTHESIZE = 'synthesize'
    QUERY = 'query'

    event_type = action.get('event', None)
    event_state = 'start' if action.get('end_event', False) is False else 'end'

    ui.text(f'Action {action_idx}: {event_type} {event_state}', weight='$5')

    if event_type == QUERY:
        if event_state == 'start':
            ui.text('Query text:')
            ui.code(str(action.get('query_text', '')))
        else:
            ui.text('Response:')
            ui.code(str(action.get('response', '')))
    elif event_type == RETRIEVE:
        if event_state == 'start':
            ui.text('Query text:')
            ui.code(str(action.get('query_text', '')))
        else:
            ui.text('Nodes:')
            for node in action.get('nodes', []):
                ui.text('Score: {}'.format(node.get('score', '-')))
                ui.code(str(node.get('text', '-')))
    elif event_type == EMBEDDING:
        if event_state == 'start':
            details = {
                'Batch Size': action.get('batch_size', '-'),
                'Model Name': action.get('model_name', ''),
            }
            ui.table({
                'Key': list(details.keys()),
                'Value': list(details.values()),
            })
        else:
            ui.text('Chunks:')
            for chunk in action.get('chunks', []):
                ui.code(str(chunk))
    elif event_type == SYNTHESIZE:
        if event_state == 'start':
            ui.text('Query text:')
            ui.code(str(action.get('query_text', '')))
        else:
            ui.text('Response:')
            ui.code(str(action.get('response', '')))
    elif event_type == TEMPLATING:
        if event_state == 'start':
            ui.text('Template Text:')
            ui.code(action.get('template_text', '-'))
            ui.text('Template Vars:')
            template_vars = action.get('template_vars', {})
            for tpl_key, tpl_val in template_vars.items():
                ui.text(str(tpl_key))
                ui.code(str(tpl_val))
        else:
            ui.text('Templating finished.')
    elif event_type == LLM:
        if event_state == 'start':
            details = {
                'Model Name': action.get('model_name', '-'),
                'Temperature': action.get('temperature', ''),
            }
            ui.table({
                'Key': list(details.keys()),
                'Value': list(details.values()),
            })
            ui.text('Messages:')
            for message in action.get('messages', []):
                ui.code(str(message))
        else:
            token_usage = action.get('token_usage', {})
            details = {
                'Model Name': action.get('model_name', '-'),
                'Completion Tokens': token_usage.get('completion_tokens', '-'),
                'Prompt Tokens': token_usage.get('prompt_tokens', '-'),
                'Total Tokens': token_usage.get('total_tokens', '-'),
            }
            ui.table({
                'Key': list(details.keys()),
                'Value': list(details.values()),
            })
            ui.text('Response:')
            ui.code(str(action.get('response', '-')))
            ui.text('Messages:')
            for message in action.get('messages', []):
                ui.code(str(message))

    ui.markdown('---')


def render_actions(actions, items_per_page, page_num):
    if not actions or len(actions) == 0:
        ui.text('No logged actions found for the selected step.')
        return

    start_idx = (page_num - 1) * items_per_page
    end_idx = start_idx + items_per_page

    for action_idx, action in enumerate(actions[start_idx:end_idx], start=start_idx):
        render_llama_action(action, action_idx)

def render_step(step, step_idx):
    actions = step.get('actions', [])

    ui.subheader('Step {}'.format(step_idx))

    details = {
        'Actions': len(actions),
    }
    ui.table({
        'Key': list(details.keys()),
        'Value': list(details.values()),
    })

    ui.markdown('---')

    if len(actions) > 10:
        row, = ui.rows(1)
        with row:
            items_per_page = ui.select(
                'Actions per page', options=('20', '40', '60'), index=0)
            total_pages = math.ceil(len(actions) / int(items_per_page))
            page_num = ui.select(
                'Page', options=[str(i) for i in range(1, total_pages + 1)], index=0)

        ui.markdown('---')
    else:
        items_per_page = '10'
        page_num = '1'

    render_actions(actions, int(items_per_page), int(page_num))

c_hash = session_state.get('container_hash')

search_signal = "search"

if c_hash is None:
    ui.subheader('No trace selected')
    ui.text('This board is intended to be used in the context of a single Trace.')
    ui.board_link('traces.py', 'Explore traces')
else:
    sequences = StepSequence.filter(f'c.hash=="{c_hash}"', signal=search_signal)
    if not sequences or len(sequences) == 0:
        ui.text('No tracked steps')
    elif len(sequences) > 1:
        ui.text('More than 1 step sequence is found. This app supports visualizing only a single step sequence.')
    else:
        sequence = sequences[0]
        steps = sequence.get('values', [])
        steps_length = len(steps)

        if steps_length == 0:
            ui.text('No tracked steps')
        else:
            if steps_length > 1:
                current_step_idx = ui.slider(label='Select the step:', value=0, min=0, max=steps_length-1, step=1)
            else:
                current_step_idx = 0
            current_step = steps[current_step_idx]
            render_step(current_step, current_step_idx)
