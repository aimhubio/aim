ui.header('ui.dataframe')
ui.text('Display a pandas dataframe as a table.')

ui.subheader('Signature')
ui.code('ui.dataframe(data)')

ui.subheader('Parameters')
ui.table({
    'name': ['data'],
    'type': ['pandas.Dataframe'],
    'default': [''],
    '': ['the data to display'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code("""import pandas as pd
import numpy as np

df = pd.DataFrame(
    np.random.randn(50, 20),
    columns=('col %d' % i for i in range(20)))

ui.dataframe(df)""")

ui.subheader('Result')


def render_example():
    import pandas as pd
    import numpy as np

    df = pd.DataFrame(
        np.random.randn(50, 20),
        columns=('col %d' % i for i in range(20)))

    ui.dataframe(df)


render_example()
