# Description: Playground demo for UI kit input components

# basic slider
# print('##### slider')
basic_slider = ui.slider(label='basic slider')
# print('basic_slider', basic_slider)
# custom slider
custom_slider = ui.slider(
    label='custom slider',
    value=20,
    min=-100,
    max=100,
    step=2
)
# print('custom_slider', custom_slider)

# basic range slider
# print('##### range slider')
basic_range_slider = ui.range_slider(label='basic range slider')
# print('basic_range_slider', basic_range_slider)
# custom range slider
custom_range_slider = ui.range_slider(
    label='custom range slider',
    value=(10, 50),
    min=-100,
    max=100,
    step=2
)
# print('custom_range_slider', custom_range_slider)

# basic text input
# print('##### text input')
basic_text_input = ui.text_input(label='basic text input')
# print('basic_text_input', basic_text_input)
# custom text input
custom_text_input = ui.text_input(
    label='custom text input',
    value="text input"
)
# print('custom_text_input', custom_text_input)

# basic number input
# print('##### number input')
basic_number_input = ui.number_input(label='basic number input')
# print('basic_number_input', basic_number_input)
# custom number input
custom_number_input = ui.number_input(
    label='custom number input',
    value=10,
    min=-100,
    max=100,
    step=2
)
# print('custom_number_input', custom_number_input)

# basic select
# print('##### select')
basic_select = ui.select(label='basic select')
# print('basic_select', basic_select)
# custom select
custom_select = ui.select(
    label='custom select',
    options=('option 1', 'option 2'),
    index=1,
    disabled=True
)
# print('custom_select', custom_select)

# basic multi select
# print('##### multi select')
basic_multi_select = ui.multi_select(label='basic multi select')
# print('basic_multi_select', basic_multi_select)
# custom multi select
custom_multi_select = ui.multi_select(
    label='custom multi select',
    options=('option 1', 'option 2'),
    index=[0]
)
# print('custom_multi_select', custom_multi_select)

# basic switch
# print('##### switch')
basic_switch = ui.switch(label='basic switch')
# print('basic_switch', basic_switch)
# custom switch
custom_switch = ui.switch(
    label='turn on',
    checked=True,
    size='lg'
)
# print('custom_switch', custom_switch)

# basic text area
# print('##### text area')
basic_text_area = ui.text_area(label='basic text area')
# print('basic_text_area', basic_text_area)
# custom text area
custom_text_area = ui.text_area(
    label='Query',
    value='metric.name == "Loss"',
    size='md',
    resize='vertical'
)
# print('custom_text_area', custom_text_area)

# basic radio
# print('##### radio')
basic_radio = ui.radio(label='basic radio')
# print('basic_radio', basic_radio)
# custom radio
custom_radio = ui.radio(
    label='custom radio',
    options=('option 1', 'option 2'),
    index=1
)
# print('custom_radio', custom_radio)

# basic checkbox
# print('##### checkbox')
basic_checkbox = ui.checkbox(label='basic checkbox')
# print('basic_checkbox', basic_checkbox)
# custom checkbox
custom_checkbox = ui.checkbox(
    label='custom checkbox',
    checked=True
)
# print('custom_checkbox', custom_checkbox)

# basic toggle button
# print('##### toggle button')
basic_toggle_button = ui.toggle_button(label='basic toggle button')
# print('basic_toggle_button', basic_toggle_button)
# custom toggle button
custom_toggle_button = ui.toggle_button(
    label='custom toggle button',
    left_value='On',
    right_value='Off',
    index=1
)
# print('custom_toggle_button', custom_toggle_button)

# header
# print('##### header')
header = ui.header(text='header')
# print('header', header)

# subheader
# print('##### subheader')
subheader = ui.subheader(text='subheader')
# print('subheader', subheader)
