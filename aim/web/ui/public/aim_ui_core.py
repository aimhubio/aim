####################
### Bindings for fetching Aim Objects
####################

from js import search, updateLayout
import hashlib


class Object:
    def __init__(self, type):
        self.type = type

    async def query(self, query=""):
        data = await search(self.type, query)
        items = []
        for item in data:
            d = item.to_py()
            d["type"] = self.type
            items.append(d)
        return items


Metric = Object("metric")
Images = Object("images")
Figures = Object("figures")
Audios = Object("audios")
Texts = Object("texts")
Distributions = Object("distributions")


def get_runs(data):
    runs_map = {}
    runs_list = []

    for item in data:
        run = item["run"]
        if run["hash"] not in runs_map:
            runs_map[run["hash"]] = True
            runs_list.append({"run": run, "type": "run"})

    return runs_list


####################
### Bindings for visualizing data with data viz elements
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


def group(name, data, options):
    group_map = {}
    grouped_data = []
    for i, item in enumerate(data):
        group_values = []
        if callable(options):
            val = options(item)
            group_values.append(val)
        else:
            for opt in options:
                val = find(
                    item,
                    str(opt) if type(opt) is not str else opt.replace("metric.", ""),
                )
                group_values.append(val)
        key = " ".join(map(str, group_values))
        group_key = hashlib.md5(key.encode()).hexdigest()
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
        sorted_groups[group_key]["order"] = i
        i = i + 1
    return sorted_groups, grouped_data


def Grid(grid):
    updateLayout(grid)


def Cell(viz, facet={"row": [], "column": []}, size={}, stack=[None]):
    if type(viz) is list:
        data = []
        for el in viz:
            data = data + el["data"]
    else:
        data = viz["data"]

    if type(data) is not list:
        viz["no_facet"] = True
        viz["size"] = size

        return viz

    no_facet = False
    if facet["row"] == [] and facet["column"] == []:
        no_facet = True

    row_map, row_data = group("row", data, facet["row"])
    column_map, column_data = group("column", data, facet["column"])

    stack_map, stack_data = group("stack", data, stack)

    items = []
    for i, elem in enumerate(data):
        item = dict(elem)
        if no_facet is False:
            row_val = row_map[row_data[i]["row"]]
            column_val = column_map[column_data[i]["column"]]
            stack_val = stack_map[stack_data[i]["stack"]]

            item["row"] = row_val["order"]
            item["column"] = column_val["order"]
            item["row_val"] = row_val["val"]
            item["column_val"] = column_val["val"]
            item["row_options"] = facet["row"]
            item["column_options"] = facet["column"]

            item["stack"] = stack_val["order"]
            item["stack_val"] = stack_val["val"]
            item["stack_options"] = stack

        items.append(item)

    if type(viz) is list:

        def get_viz_for_type(type):
            for el in viz:
                if el["data"][0]["type"] == type:
                    return el["type"]

        union_viz = {}
        for el in viz:
            for key in el:
                union_viz[key] = el[key]

        union_viz["type"] = get_viz_for_type
        union_viz["data"] = items
        union_viz["no_facet"] = no_facet

        return union_viz
    else:
        viz["data"] = items
        viz["no_facet"] = no_facet
        viz["size"] = size

        return viz


def LineChart(
    data,
    x,
    y,
    color=[],
    stroke_style=[],
    options={},
    on_chart_hover=None,
    on_point_click=None,
):
    color_map, color_data = group("color", data, color)
    stroke_map, stroke_data = group("stroke_style", data, stroke_style)
    lines = []
    for i, item in enumerate(data):
        color_val = colors[color_map[color_data[i]["color"]]["order"] % len(colors)]
        stroke_val = stroke_styles[
            stroke_map[stroke_data[i]["stroke_style"]]["order"] % len(stroke_styles)
        ]
        line = item
        line["key"] = i
        line["data"] = {"xValues": item[x], "yValues": item[y]}
        line["color"] = color_val
        line["dasharray"] = stroke_val

        lines.append(line)

    async def on_active_point_change(val, is_active):
        if is_active:
            if callable(on_point_click):
                data = val.to_py()
                item = lines[data["key"]]
                await on_point_click(item, data)
        else:
            if callable(on_chart_hover):
                data = val.to_py()
                item = lines[data["key"]]
                await on_chart_hover(item, data)

    return {
        "type": "LineChart",
        "data": lines,
        "callbacks": {"on_active_point_change": on_active_point_change},
        "options": options,
    }


def ImagesList(data):
    images = []
    for i, item in enumerate(data):
        image = item
        image["key"] = i

        images.append(image)
    return {
        "type": "Images",
        "data": images,
    }


def AudiosList(data):
    audios = []
    for i, item in enumerate(data):
        audio = item
        audio["key"] = i

        audios.append(audio)
    return {
        "type": "Audios",
        "data": audios,
    }


def TextsList(data, color=[]):
    color_map, color_data = group("color", data, color)

    texts = []
    for i, item in enumerate(data):
        color_val = colors[color_map[color_data[i]["color"]]["order"] % len(colors)]
        text = item
        text["key"] = i
        text["color"] = color_val

        texts.append(text)
    return {
        "type": "Text",
        "data": texts,
    }


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

    return {
        "type": "Plotly",
        "data": figures,
    }


def JSON(data):
    return {
        "type": "JSON",
        "data": data,
    }


def Table(data):
    return {"type": "DataFrame", "data": data.to_json(orient="records")}
