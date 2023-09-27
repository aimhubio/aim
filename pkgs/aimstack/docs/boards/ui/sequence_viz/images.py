ui.header('ui.images')
ui.text('Display an images list component.')

ui.subheader('Signature')
ui.code("ui.images(data)")

ui.subheader('Parameters')
ui.table({
    'name': ['data'],
    'type': ['List[dict]'],
    'default': ['', '{}'],
    '': [
        'The data for the ImagesList component'
    ],
})

ui.subheader('Example')
ui.code("""from base import Images

images = Images.filter()

ui.images(images)""")
