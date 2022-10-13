####################
### Bindings for fetching Aim Objects
####################

from js import search


class Object:
    def __init__(self, type):
        self.type = type

    async def get(self, query=""):
        data = await search(query)
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
    return grid


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
        group_key = hash(" ".join(map(str, group_values)))
        if group_key not in group_map:
            group_map[group_key] = {"val": group_values, "order": None}
        new_item = item.to_py()
        new_item[type] = group_key
        grouped_data.append(new_item)
    sorted_groups = {k: v for k, v in sorted(group_map.items())}
    i = 0
    for group_key in sorted_groups:
        sorted_groups[group_key]["order"] = i
        i = i + 1
    return sorted_groups, grouped_data


def line_chart(
    data, x, y, color=[], stroke_style=[], facet=[], callbacks={}, options={}
):
    facet_map, facet_data = group("facet", data, facet)
    color_map, color_data = group("color", data, color)
    stroke_map, stroke_data = group("stroke_style", data, stroke_style)
    lines = [None] * len(facet_map)
    for i, el in enumerate(lines):
        lines[i] = []
    for i, item in enumerate(data):
        item = item.to_py()
        facet_val = facet_map[facet_data[i]["facet"]]["order"]
        color_val = colors[color_map[color_data[i]["color"]]["order"] % len(colors)]
        stroke_val = stroke_styles[
            stroke_map[stroke_data[i]["stroke_style"]]["order"] % len(stroke_styles)
        ]
        lines[facet_val].append(
            {
                "key": i,
                "data": {"xValues": item[x], "yValues": item[y]},
                "color": color_val,
                "dasharray": stroke_val,
            }
        )

    return {
        "type": "LineChart",
        "data": lines,
        "callbacks": callbacks,
        "options": options,
    }
