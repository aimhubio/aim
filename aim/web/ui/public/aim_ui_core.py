####################
# Bindings for fetching Aim Objects
####################

from pyodide import create_proxy
from js import search
import hashlib
import copy


memoize_cache = {}


def deep_copy(obj):
    if isinstance(obj, (list, tuple)):
        return type(obj)(deep_copy(x) for x in obj)
    elif isinstance(obj, dict):
        return type(obj)((deep_copy(k), deep_copy(v)) for k, v in obj.items())
    elif isinstance(obj, set):
        return type(obj)(deep_copy(x) for x in obj)
    elif hasattr(obj, '__dict__'):
        result = type(obj)()
        result.__dict__.update(deep_copy(obj.__dict__))
        return result
    elif isinstance(obj, memoryview):
        return memoryview(bytes(obj))
    else:
        return obj


def memoize_async(func):
    async def wrapper(*args, **kwargs):
        if func.__name__ not in memoize_cache:
            memoize_cache[func.__name__] = {}

        key = generate_key(args + tuple(kwargs.items()))

        if key not in memoize_cache[func.__name__]:
            memoize_cache[func.__name__][key] = await func(*args, **kwargs)

        return deep_copy(memoize_cache[func.__name__][key])

    return wrapper


def memoize(func):
    def wrapper(*args, **kwargs):
        if func.__name__ not in memoize_cache:
            memoize_cache[func.__name__] = {}

        key = generate_key(args + tuple(kwargs.items()))

        if key not in memoize_cache[func.__name__]:
            memoize_cache[func.__name__][key] = func(*args, **kwargs)

        return deep_copy(memoize_cache[func.__name__][key])

    return wrapper


class Object:
    def __init__(self, type, methods={}):
        self.type = type
        self.methods = methods
        self.items = []

    @memoize_async
    async def query(self, query=""):
        data = await search(self.type, query)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = self.type
            d["key"] = i
            i = i + 1
            items.append(d)
        self.items = items
        data.destroy()
        return items


class MetricObject(Object):
    @memoize
    def dataframe(self, key):
        import pandas as pd

        metric = self.items[key]

        df_source = {
            "run.hash": [],
            "metric.name": [],
            "metric.context": [],
            "step": [],
            "value": [],
        }

        for i, s in enumerate(metric["steps"]):
            df_source["run.hash"].append(metric["run"]["hash"])
            df_source["metric.name"].append(metric["name"])
            df_source["metric.context"].append(str(metric["context"]))
            df_source["step"].append(metric["steps"][i])
            df_source["value"].append(metric["values"][i])

        return pd.DataFrame(df_source)


Metric = MetricObject("metric")
Images = Object("images")
Figures = Object("figures")
Audios = Object("audios")
Texts = Object("texts")
Distributions = Object("distributions")


####################
# Bindings for visualizing data with data viz elements
####################


def find(obj, element):
    keys = element.split(".")
    rv = obj
    for key in keys:
        try:
            rv = rv[key]
        except:
            return None
    return rv


colors = [
    "#3E72E7",
    "#18AB6D",
    "#7A4CE0",
    "#E149A0",
    "#E43D3D",
    "#E8853D",
    "#0394B4",
    "#729B1B",
]

stroke_styles = [
    "none",
    "5 5",
    "10 5 5 5",
    "10 5 5 5 5 5",
    "10 5 5 5 5 5 5 5",
    "20 5 10 5",
    "20 5 10 5 10 5",
    "20 5 10 5 10 5 5 5",
    "20 5 10 5 5 5 5 5",
]


def generate_key(data):
    content = str(data)
    return hashlib.md5(content.encode()).hexdigest()


viz_map_keys = {}


def update_viz_map(viz_type):
    if viz_type in viz_map_keys:
        viz_map_keys[viz_type] = viz_map_keys[viz_type] + 1
    else:
        viz_map_keys[viz_type] = 0

    viz_key = viz_type + str(viz_map_keys[viz_type])

    return viz_key


def apply_group_value_pattern(value, list):
    if type(value) is int:
        return list[value % len(list)]
    return value


@memoize
def group(name, data, options):
    group_map = {}
    grouped_data = []
    for item in data:
        group_values = []
        if callable(options):
            val = options(item)
            if type(val) == bool:
                val = int(val)
            group_values.append(val)
        else:
            for opt in options:
                val = find(
                    item,
                    str(opt) if type(opt) is not str else opt.replace("metric.", ""),
                )
                group_values.append(val)

        group_key = generate_key(group_values)

        if group_key not in group_map:
            group_map[group_key] = {
                "options": options,
                "val": group_values,
                "order": None,
            }
        item[name] = group_key
        grouped_data.append(item)
    sorted_groups = group_map
    if callable(options):
        sorted_groups = {
            k: v
            for k, v in sorted(
                sorted_groups.items(), key=lambda x: str(x[1]["val"]), reverse=True
            )
        }
    else:
        for i, opt in enumerate(options):
            sorted_groups = {
                k: v
                for k, v in sorted(
                    sorted_groups.items(),
                    key=lambda x: (3, str(x[1]["val"][i]))
                    if type(x[1]["val"][i]) in [tuple, list, dict]
                    else (
                        (0, int(x[1]["val"][i]))
                        if str(x[1]["val"][i]).isdigit()
                        else (
                            (2, str(x[1]["val"][i]))
                            if x[1]["val"][i] is None
                            else (1, str(x[1]["val"][i]))
                        )
                    ),
                )
            }

    i = 0
    for group_key in sorted_groups:
        sorted_groups[group_key]["order"] = (
            sorted_groups[group_key]["val"][0] if callable(options) else i
        )
        i = i + 1
    return sorted_groups, grouped_data


current_layout = [[]]


def layout(grid):
    from js import updateLayout

    updateLayout(grid)


def automatic_layout_update(data):
    is_found = False
    for i, row in enumerate(current_layout):
        for j, cell in enumerate(row):
            if cell["key"] == data["key"]:
                current_layout[i][j] = data
                is_found = True

    if is_found == False:
        if current_layout == [[]]:
            current_layout[0] = [data]
        else:
            current_layout.append([data])

    layout(current_layout)


state = {}


def set_state(update):
    from js import setState

    state.update(update)
    setState(update)


def Group(
    viz,
    facet={"row": [], "column": []},
    size={},
    stack=[None],
    **group_list,
):
    if type(viz) is list:
        viz = list(viz)
        data = []
        for el in viz:
            data = data + el["data"]
    else:
        viz = dict(viz)
        data = viz["data"]

    if type(data) is not list:
        viz["no_facet"] = True
        viz["size"] = size

        automatic_layout_update(viz)
        return viz

    no_facet = False
    if facet["row"] == [] and facet["column"] == []:
        no_facet = True

    row_map, row_data = group("row", data, facet["row"])
    column_map, column_data = group("column", data, facet["column"])

    additional_groups = []

    for group_option in group_list.items():
        group_name, group_options = group_option
        group_option_map, group_option_data = group(group_name, data, group_options)
        additional_groups.append(
            {
                "name": group_name,
                "options": group_options,
                "data": group_option_data,
                "map": group_option_map,
            }
        )

    stack_map, stack_data = group("stack", data, stack)

    items = []
    for i, elem in enumerate(data):
        item = dict(elem)
        if no_facet is False:
            row_val = row_map[row_data[i]["row"]]
            column_val = column_map[column_data[i]["column"]]
            stack_val = stack_map[stack_data[i]["stack"]]

            for additional in additional_groups:
                additional["current"] = additional["map"][
                    additional["data"][i][additional["name"]]
                ]

            item["row"] = row_val["order"]
            item["column"] = column_val["order"]
            item["row_val"] = row_val["val"]
            item["column_val"] = column_val["val"]
            item["row_options"] = facet["row"]
            item["column_options"] = facet["column"]

            for additional in additional_groups:
                item[additional["name"]] = additional["current"]["order"]
                if additional["name"] == "color":
                    item[additional["name"]] = apply_group_value_pattern(
                        item[additional["name"]], colors
                    )
                elif additional["name"] == "stroke_style":
                    item[additional["name"]] = apply_group_value_pattern(
                        item[additional["name"]], stroke_styles
                    )
                item[f'{additional["name"]}_val'] = additional["current"]["val"]
                item[f'{additional["name"]}_options'] = additional["options"]

            item["stack"] = stack_val["order"]
            item["stack_val"] = stack_val["val"]
            item["stack_options"] = stack

        items.append(item)

    if type(viz) is list:

        def get_viz_for_type(type):
            for el in viz:
                if el["data"] and el["data"][0] and el["data"][0]["type"] == type:
                    return el["type"]

        union_viz = {}
        for el in viz:
            for key in el:
                union_viz[key] = el[key]

        union_viz["type"] = get_viz_for_type
        union_viz["data"] = items
        union_viz["no_facet"] = no_facet

        automatic_layout_update(union_viz)
        return union_viz
    else:
        viz["data"] = items
        viz["no_facet"] = no_facet
        viz["size"] = size

        automatic_layout_update(viz)
        return viz


def LineChart(
    data,
    x,
    y,
    color=[],
    stroke_style=[],
    options={},
    on_point_click=None,
    on_chart_hover=None,
):

    component_key = update_viz_map("LineChart")

    color_map, color_data = group("color", data, color)
    stroke_map, stroke_data = group("stroke_style", data, stroke_style)
    lines = []
    for i, item in enumerate(data):
        color_val = apply_group_value_pattern(
            color_map[color_data[i]["color"]]["order"], colors
        )
        stroke_val = apply_group_value_pattern(
            stroke_map[stroke_data[i]["stroke_style"]]["order"], stroke_styles
        )

        line = dict(item)
        line["key"] = i
        line["data"] = {"xValues": find(item, x), "yValues": find(item, y)}
        line["color"] = color_val
        line["dasharray"] = stroke_val

        lines.append(line)

    async def on_active_point_change(val, is_active):
        data = create_proxy(val.to_py())
        point = dict(data)
        data.destroy()
        item = lines[point["key"]]
        if is_active:
            if callable(set_state):
                set_state(
                    {
                        component_key: {
                            "focused_line_data": item,
                            "focused_point_data": point,
                        }
                    }
                )
            if callable(on_point_click):
                await on_point_click(item, point)
        else:
            if callable(set_state):
                set_state(
                    {
                        component_key: {
                            "hovered_line_data": item,
                            "hovered_point_data": point,
                        }
                    }
                )
            if callable(on_chart_hover):
                await on_chart_hover(item, point)

    line_chart_data = {
        "type": "LineChart",
        "key": component_key,
        "data": lines,
        "callbacks": {"on_active_point_change": on_active_point_change},
        "options": options,
    }

    component_fields = (
        state and component_key in state and state[component_key] or {component_key: {}}
    )

    component_state = {
        "hovered_line_data": "hovered_line_data" in component_fields
        and component_fields["hovered_line_data"]
        or None,
        "focused_line_data": "focused_line_data" in component_fields
        and component_fields["focused_line_data"]
        or None,
        "hovered_point_data": "hovered_point_data" in component_fields
        and component_fields["hovered_point_data"]
        or None,
        "focused_point_data": "focused_point_data" in component_fields
        and component_fields["focused_point_data"]
        or None,
    }

    line_chart_data.update(component_state)

    automatic_layout_update(line_chart_data)

    return line_chart_data


def ImagesList(data):
    images = []
    for i, item in enumerate(data):
        image = item
        image["key"] = i

        images.append(image)

    images_data = {
        "type": "Images",
        "data": images,
    }

    images_data["key"] = update_viz_map(images_data["type"])

    automatic_layout_update(images_data)

    return images_data


def AudiosList(data):
    audios = []
    for i, item in enumerate(data):
        audio = item
        audio["key"] = i

        audios.append(audio)

    audios_data = {
        "type": "Audios",
        "data": audios,
    }

    audios_data["key"] = update_viz_map(audios_data["type"])

    automatic_layout_update(audios_data)

    return audios_data


def TextsList(data, color=[]):
    color_map, color_data = group("color", data, color)

    texts = []
    for i, item in enumerate(data):
        color_val = apply_group_value_pattern(
            color_map[color_data[i]["color"]]["order"], colors
        )
        text = item
        text["key"] = i
        text["color"] = color_val

        texts.append(text)

    texts_data = {
        "type": "Text",
        "data": texts,
    }

    texts_data["key"] = update_viz_map(texts_data["type"])

    automatic_layout_update(texts_data)

    return texts_data


def FiguresList(data):
    if type(data) is not list:
        items = [data.to_json()]
    else:
        items = []
        for d in data:
            items.append(d.to_json())

    figures = []
    for i, item in enumerate(items):
        figure = {
            "key": i,
            "data": item,
        }

        figures.append(figure)

    figures_data = {
        "type": "Plotly",
        "data": figures,
    }

    figures_data["key"] = update_viz_map(figures_data["type"])

    automatic_layout_update(figures_data)

    return figures_data


def JSON(data):
    json_data = {
        "type": "JSON",
        "data": data,
    }

    json_data["key"] = update_viz_map(json_data["type"])

    automatic_layout_update(json_data)

    return json_data


def Table(data):
    table_data = {"type": "DataFrame", "data": data.to_json(orient="records")}

    table_data["key"] = update_viz_map(table_data["type"])

    automatic_layout_update(table_data)

    return table_data


def HTML(data):
    html_data = {
        "type": "HTML",
        "data": data,
    }

    html_data["key"] = update_viz_map(html_data["type"])

    automatic_layout_update(html_data)

    return html_data
