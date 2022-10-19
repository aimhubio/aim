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
        return items


Metric = Object("metric")
Image = Object("images")
Figure = Object("figures")
Audio = Object("audios")
Text = Object("texts")
Distribution = Object("distributions")


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
        item[type] = group_key
        grouped_data.append(item)
    sorted_groups = {
        k: v for k, v in sorted(group_map.items(), key=lambda x: repr(x[1]["val"]))
    }
    i = 0
    for group_key in sorted_groups:
        sorted_groups[group_key]["order"] = i
        i = i + 1
    return sorted_groups, grouped_data


def Grid(grid):
    updateLayout(grid)


def GridCell(viz, facet={"row": [], "column": []}, size={}):
    if type(viz) is list:
        data = []
        for el in viz:
            data = data + el["data"]
    else:
        data = viz["data"]
    no_facet = False
    if facet["row"] == [] and facet["column"] == []:
        no_facet = True

    row_map, row_data = group("row", data, facet["row"])
    column_map, column_data = group("column", data, facet["column"])

    items = []
    for i, item in enumerate(data):
        row_val = row_map[row_data[i]["row"]]
        column_val = column_map[column_data[i]["column"]]

        item["row"] = row_val["order"]
        item["column"] = column_val["order"]
        item["row_val"] = row_val["val"]
        item["column_val"] = column_val["val"]
        item["row_options"] = facet["row"]
        item["column_options"] = facet["column"]

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

        return union_viz
    else:
        viz["data"] = items
        viz["no_facet"] = no_facet
        viz["size"] = size

        return viz


def line_chart(
    data,
    x,
    y,
    color=[],
    stroke_style=[],
    callbacks={},
    options={},
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

    return {
        "type": "LineChart",
        "data": lines,
        "callbacks": callbacks,
        "options": options,
    }


def images_list(data):
    images = []
    for i, item in enumerate(data):
        image = item
        image["key"] = i

        images.append(image)
    return {
        "type": "Images",
        "data": images,
    }


def audios_list(data):
    audios = []
    for i, item in enumerate(data):
        audio = item
        audio["key"] = i

        audios.append(audio)
    return {
        "type": "Audios",
        "data": audios,
    }


def text_list(data, color=[]):
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


def json(
    data,
):
    return {
        "type": "JSON",
        "data": data,
    }
