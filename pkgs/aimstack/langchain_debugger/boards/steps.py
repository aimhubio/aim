import math

from langchain_debugger import StepSequence


def render_action(action, action_idx):
    if not action:
        return

    ON_LLM_START = 'on_llm_start'
    ON_LLM_END = 'on_llm_end'
    ON_CHAIN_START = 'on_chain_start'
    ON_CHAIN_END = 'on_chain_end'
    ON_TOOL_START = 'on_tool_start'
    ON_TOOL_END = 'on_tool_end'

    event_type = action.get('event')

    ui.text(f'Action {action_idx}: {event_type}', weight='$5')

    if event_type == ON_LLM_START:
        details = {
            'Model Name': action.get('model_name'),
            'Temperature': action.get('temperature'),
        }
        ui.table({
            'Key': list(details.keys()),
            'Value': list(details.values()),
        })
        prompts = action.get('prompts')
        if prompts:
            ui.text('Prompts:')
            for prompt in prompts:
                ui.code(prompt)
    elif event_type == ON_LLM_END:
        details = {
            'Model Name': action.get('model_name'),
        }
        ui.table({
            'Key': list(details.keys()),
            'Value': list(details.values()),
        })
        generations = action.get('generations')
        if generations:
            ui.text('Generations:')
            for generation in generations:
                ui.code(generation.get('text', ''))
    elif event_type == ON_CHAIN_START:
        details = {
            'Chain': action.get('id'),
        }
        ui.table({
            'Key': list(details.keys()),
            'Value': list(details.values()),
        })
        input = action.get('input')
        if input:
            ui.text('Input:')
            ui.code(input)
    elif event_type == ON_CHAIN_END:
        details = {
            'Chain': action.get('id'),
        }
        ui.table({
            'Key': list(details.keys()),
            'Value': list(details.values()),
        })
        output = action.get('output')
        text = action.get('text')
        if output:
            ui.text('Output:')
            ui.code(output)
        if text:
            ui.text('Text:')
            ui.code(text)
    elif event_type == ON_TOOL_START:
        details = {
            'Name': action.get('name'),
            'Description': action.get('description'),
        }
        ui.table({
            'Key': list(details.keys()),
            'Value': list(details.values()),
        })
        input = action.get('input')
        if input:
            ui.text('Input:')
            ui.code(input)
    elif event_type == ON_TOOL_END:
        details = {
            'Name': action.get('name'),
        }
        ui.table({
            'Key': list(details.keys()),
            'Value': list(details.values()),
        })
        output = action.get('output')
        if output:
            ui.text('Output:')
            ui.code(output)

    ui.markdown('---')


def render_actions(actions, items_per_page, page_num):
    if not actions:
        ui.text('No logged actions found for the selected step.')
        return

    start_idx = (page_num - 1) * items_per_page
    end_idx = start_idx + items_per_page

    for action_idx, action in enumerate(actions[start_idx:end_idx], start=start_idx):
        render_action(action, action_idx)

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
