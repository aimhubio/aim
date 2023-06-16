ui.header('ui.plotly')
ui.text('Display an interactive Plotly chart.')

ui.subheader('Signature')
ui.code('ui.plotly(figure)')

ui.subheader('Parameters')
ui.table({
    'name': ['figure'],
    'type': ['plotly.Figure'],
    'default': [''],
    '': ['Plotly Figure to be plotted'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code("""import pandas
import plotly.express as px

df = px.data.gapminder()

fig = px.scatter(
    df.query("year==2007"),
    x="gdpPercap",
    y="lifeExp",
    size="pop",
    color="continent",
    hover_name="country",
    log_x=True,
    size_max=60,
)

ui.plotly(fig)""")


def render_example():
    import pandas
    import plotly.express as px

    df = px.data.gapminder()

    fig = px.scatter(
        df.query("year==2007"),
        x="gdpPercap",
        y="lifeExp",
        size="pop",
        color="continent",
        hover_name="country",
        log_x=True,
        size_max=60,
    )

    ui.plotly(fig)


render_example()
