####################
### Bindings for fetching Aim Objects
####################

from js import search, updateLayout
import hashlib


class Object:
    def __init__(self, type):
        self.type = type

    async def get(self, query=""):
        data = await search(self.type, query)
        items = []
        for item in data:
            d = item.to_py()
            d["type"] = self.type
            items.append(d)
        return data


Metric = Object("metric")
Image = Object("images")
Figure = Object("figures")
Audio = Object("audios")
Text = Object("texts")
Distribution = Object("distributions")


####################
### Bindings for visualizing data with data viz elements
####################


def display(grid):
    updateLayout(grid)


def find(obj, element):
    keys = element.split(".")
    rv = obj.to_py()
    for key in keys:
        rv = rv[key]
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


def group(type, data, options):
    group_map = {}
    grouped_data = []
    for i, item in enumerate(data):
        group_values = []
        if callable(options):
            val = options(item)
            group_values.append(val)
        else:
            for opt in options:
                val = find(item, opt.replace("metric.", ""))
                group_values.append(val)
        key = " ".join(map(str, group_values))
        group_key = hashlib.md5(key.encode()).hexdigest()
        if group_key not in group_map:
            group_map[group_key] = {
                "options": options,
                "val": group_values,
                "order": None,
            }
        new_item = item.to_py()
        new_item[type] = group_key
        grouped_data.append(new_item)
    sorted_groups = {
        k: v for k, v in sorted(group_map.items(), key=lambda x: repr(x[1]["val"]))
    }
    i = 0
    for group_key in sorted_groups:
        sorted_groups[group_key]["order"] = i
        i = i + 1
    return sorted_groups, grouped_data


def line_chart(
    data,
    x,
    y,
    color=[],
    stroke_style=[],
    facet={"row": [], "column": []},
    callbacks={},
    options={},
    size={},
):
    no_facet = False
    if facet["row"] == [] and facet["column"] == []:
        no_facet = True
    row_map, row_data = group("row", data, facet["row"])
    column_map, column_data = group("column", data, facet["column"])
    color_map, color_data = group("color", data, color)
    stroke_map, stroke_data = group("stroke_style", data, stroke_style)
    lines = []
    for i, item in enumerate(data):
        item = item.to_py()
        row_val = row_map[row_data[i]["row"]]
        column_val = column_map[column_data[i]["column"]]
        color_val = colors[color_map[color_data[i]["color"]]["order"] % len(colors)]
        stroke_val = stroke_styles[
            stroke_map[stroke_data[i]["stroke_style"]]["order"] % len(stroke_styles)
        ]
        lines.append(
            {
                "key": i,
                "data": {"xValues": item[x], "yValues": item[y]},
                "color": color_val,
                "dasharray": stroke_val,
                "row": row_val["order"],
                "column": column_val["order"],
                "row_val": row_val["val"],
                "column_val": column_val["val"],
                "row_options": facet["row"],
                "column_options": facet["column"],
            }
        )

    return {
        "type": "LineChart",
        "data": lines,
        "callbacks": callbacks,
        "options": options,
        "size": size,
        "no_facet": no_facet,
    }


def images_list(data, facet={"row": [], "column": []}, size={}):
    no_facet = False
    if facet["row"] == [] and facet["column"] == []:
        no_facet = True

    row_map, row_data = group("row", data, facet["row"])
    column_map, column_data = group("column", data, facet["column"])

    images = []
    for i, item in enumerate(data):
        item = item.to_py()
        row_val = row_map[row_data[i]["row"]]
        column_val = column_map[column_data[i]["column"]]
        images.append(
            {
                "key": i,
                "data": item,
                "row": row_val["order"],
                "column": column_val["order"],
                "row_val": row_val["val"],
                "column_val": column_val["val"],
                "row_options": facet["row"],
                "column_options": facet["column"],
            }
        )
    return {
        "type": "Images",
        "data": images,
        "size": size,
        "no_facet": no_facet,
    }


def json(
    data,
    facet={"row": [], "column": []},
    size={},
):
    no_facet = False
    if facet["row"] == [] and facet["column"] == []:
        no_facet = True
    return {
        "type": "JSON",
        "data": data,
        "size": size,
        "no_facet": no_facet,
    }
