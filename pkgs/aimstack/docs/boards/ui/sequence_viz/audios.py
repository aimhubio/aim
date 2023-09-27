ui.header('ui.audios')
ui.text('Display an audios list component.')

ui.subheader('Signature')
ui.code("ui.audios(data)")

ui.subheader('Parameters')
ui.table({
    'name': ['data'],
    'type': ['List[dict]'],
    'default': ['', '{}'],
    '': [
        'The data for the AudiosList component'
    ],
})

ui.subheader('Example')
ui.code("""from base import Audios

audios = Audios.filter()

ui.audios(audios)""")
