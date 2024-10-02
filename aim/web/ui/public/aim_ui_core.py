####################
# Bindings for fetching Aim Objects
####################

from pyodide.ffi import create_proxy
from js import search
import hashlib


memoize_cache = {}


# Custom deep_copy to cover all types objects
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


# memoize functions to cache the return values of heavy time functions per argument values
def memoize_async(func):
    async def wrapper(*args, **kwargs):
        if func.__name__ not in memoize_cache:
            memoize_cache[func.__name__] = {}

        key = generate_key(args + tuple(kwargs.items()))

        if key not in memoize_cache[func.__name__]:
            memoize_cache[func.__name__][key] = await func(*args, **kwargs)

        return memoize_cache[func.__name__][key]

    return wrapper


def memoize(func):
    def wrapper(*args, **kwargs):
        if func.__name__ not in memoize_cache:
            memoize_cache[func.__name__] = {}

        key = generate_key(args + tuple(kwargs.items()))

        if key not in memoize_cache[func.__name__]:
            memoize_cache[func.__name__][key] = func(*args, **kwargs)

        return memoize_cache[func.__name__][key]

    return wrapper


# cutom `repo` object with sequence fetching functions used in reports to fetch values from BE based on queries
class repo:
    @classmethod
    @memoize_async
    async def fetch_runs(self, query="True"):
        type = 'run'
        data = await search(type, query)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = type
            d["key"] = i
            i = i + 1
            items.append(d)
        data.destroy()
        return items

    @classmethod
    @memoize_async
    async def fetch_metrics(self, query="True"):
        type = 'metric'
        data = await search(type, query)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = type
            d["key"] = i
            i = i + 1
            items.append(d)
        data.destroy()
        return items

    @classmethod
    @memoize_async
    async def fetch_images(self, query="True"):
        type = 'images'
        data = await search(type, query)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = type
            d["key"] = i
            i = i + 1
            items.append(d)
        data.destroy()
        return items

    @classmethod
    @memoize_async
    async def fetch_audios(self, query="True"):
        type = 'audios'
        data = await search(type, query)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = type
            d["key"] = i
            i = i + 1
            items.append(d)
        data.destroy()
        return items

    @classmethod
    @memoize_async
    async def fetch_texts(self, query="True"):
        type = 'texts'
        data = await search(type, query)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = type
            d["key"] = i
            i = i + 1
            items.append(d)
        data.destroy()
        return items

    @classmethod
    @memoize_async
    async def fetch_figures(self, query="True"):
        type = 'figures'
        data = await search(type, query)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = type
            d["key"] = i
            i = i + 1
            items.append(d)
        data.destroy()
        return items


####################
# Bindings for visualizing data with data viz elements
####################


# custom function to find the value of dot separated path in nested dicts
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


# reproducible key generation for function and group arguments
def generate_key(data):
    content = str(data)
    return hashlib.md5(content.encode()).hexdigest()


board_id = None

viz_map_keys = {}


def update_viz_map(viz_type, key=None):
    if key != None:
        viz_map_keys[key] = key
        return key
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


# main data grouping function
# grouping options can be callable or any dot separated paths
@memoize
def group(name, data, options, key=None):
    group_map = {}
    grouped_data = []
    items = deep_copy(data)
    for item in items:
        # go over the data and find the each value corresponding to the grouping option
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
        # sort the grouped values based on the value type of each corresponding froup options
        # priorities are as follows: digits, any basic type, None, (list, tuple, dict)
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
        # apply order values for further usage based on the sorting order above
        sorted_groups[group_key]["order"] = (
            sorted_groups[group_key]["val"][0] if callable(options) else i
        )
        i = i + 1
    return sorted_groups, grouped_data


current_layout = []


state = {}


def set_state(update, board_id):
    from js import setState

    if board_id not in state:
        state[board_id] = {}

    state[board_id].update(update)
    setState(state, board_id)


block_context = {
    "current": 0,
}


def render_to_layout(data):
    from js import updateLayout

    is_found = False
    for i, cell in enumerate(current_layout):
        if cell["key"] == data["key"]:
            current_layout[i] = data
            is_found = True

    if is_found == False:
        current_layout.append(data)

    updateLayout(current_layout, data["board_id"])


class Element:
    def __init__(self):
        self.parent_block = None
        self.board_id = board_id

    def set_parent_block(self, block):
        self.parent_block = block


class Block(Element):
    def __init__(self, type):
        super().__init__()
        block_context["current"] += 1
        self.block_context = {
            "id": block_context["current"],
            "type": type
        }
        self.key = generate_key(self.block_context)

        self.render()

    def add(self, element):
        element.set_parent_block(self.block_context)
        element.render()

    def render(self):
        block_data = {
            "element": 'block',
            "block_context": self.block_context,
            "key": self.key,
            "parent_block": self.parent_block,
            "board_id": self.board_id
        }

        render_to_layout(block_data)


class Row(Block):
    def __init__(self):
        super().__init__('row')


class Column(Block):
    def __init__(self):
        super().__init__('column')


class Component(Element):
    def __init__(self, key, type):
        super().__init__()
        self.state = {}
        self.key = key
        self.type = type
        self.data = None
        self.callbacks = {}
        self.options = {}
        self.state = state[board_id][key] if board_id in state and key in state[board_id] else {}
        self.no_facet = True

    def set_state(self, value):
        set_state({
            self.key: value
        }, self.board_id)

    def render(self):
        component_data = {
            "type": self.type,
            "key": self.key,
            "data": self.data,
            "callbacks": self.callbacks,
            "options": self.options,
            "parent_block": self.parent_block,
            "no_facet": self.no_facet,
            "board_id": self.board_id
        }

        component_data.update(self.state)

        render_to_layout(component_data)

    def group(self, prop, value):
        if isinstance(value, str):
            value = [value]

        # group the data with the main grouping function
        group_map, group_data = group(prop, self.data, value, self.key)

        # apply property values corresponding to the group order
        items = []
        for i, item in enumerate(self.data):
            elem = dict(item)
            current = group_map[group_data[i][prop]]

            if prop == "color":
                color_val = apply_group_value_pattern(
                    current["order"], colors
                )
                elem["color"] = color_val
                elem["color_val"] = current["val"]
                elem["color_options"] = value
            elif prop == "stroke_style":
                stroke_val = apply_group_value_pattern(
                    current["order"], stroke_styles
                )
                elem["dasharray"] = stroke_val
                elem["dasharray_val"] = current["val"]
                elem["dasharray_options"] = value
            else:
                elem[prop] = current["order"]
                elem[f"{prop}_val"] = current["val"]
                elem[f"{prop}_options"] = value

            if prop == "row" or prop == "column":
                self.no_facet = False

            items.append(elem)

        self.data = items

        self.render()


class LineChart(Component):
    def __init__(self, data, x='steps', y='values', color=[], stroke_style=[], options={}, key=None):
        component_type = "LineChart"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group("stroke_style", data, stroke_style, component_key)
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

        self.data = lines
        self.options = options
        self.callbacks = {
            "on_active_point_change": self.on_active_point_change
        }

        self.render()

    @property
    def active_line(self):
        return self.state["active_line"] if "active_line" in self.state else None

    @property
    def focused_line(self):
        return self.state["focused_line"] if "focused_line" in self.state else None

    @property
    def active_point(self):
        return self.state["active_point"] if "active_point" in self.state else None

    @property
    def focused_point(self):
        return self.state["focused_point"] if "focused_point" in self.state else None

    async def on_active_point_change(self, val, is_active):
        if val != None:
            data = create_proxy(val.to_py())
            item = self.data[data["key"]]

            if is_active:
                self.set_state({
                    "focused_line": item,
                    "focused_point": data,
                })
            else:
                self.set_state({
                    "active_line": item,
                    "active_point": data,
                })

            data.destroy()


class ImagesList(Component):
    def __init__(self, data, key=None):
        component_type = "Images"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        images = []

        for i, item in enumerate(data):
            image = item
            image["key"] = i

            images.append(image)

        self.data = images

        self.render()


class AudiosList(Component):
    def __init__(self, data, key=None):
        component_type = "Audios"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        audios = []

        for i, item in enumerate(data):
            audio = item
            audio["key"] = i

            audios.append(audio)

        self.data = audios

        self.render()


class TextsList(Component):
    def __init__(self, data, color=[], key=None):
        component_type = "Texts"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        color_map, color_data = group("color", data, color, component_key)

        texts = []

        for i, item in enumerate(data):
            color_val = apply_group_value_pattern(
                color_map[color_data[i]["color"]]["order"], colors
            )
            text = item
            text["key"] = i
            text["color"] = color_val

            texts.append(text)

        self.data = texts

        self.render()


class FiguresList(Component):
    def __init__(self, data, key=None):
        component_type = "Figures"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        figures = []

        for i, item in enumerate(data):
            figure = {
                "key": i,
                "data": item.to_json(),
            }

            figures.append(figure)

        self.data = figures

        self.render()


class JSON(Component):
    def __init__(self, data, key=None):
        component_type = "JSON"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = data

        self.render()


class DataFrame(Component):
    def __init__(self, data, key=None):
        component_type = "DataFrame"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = data.to_json(orient="records")

        self.render()


class HTML(Component):
    def __init__(self, data, key=None):
        component_type = "HTML"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = data

        self.render()


class RunMessages(Component):
    def __init__(self, run_hash, key=None):
        component_type = "RunMessages"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = run_hash

        self.render()


class RunNotes(Component):
    def __init__(self, run_hash, key=None):
        component_type = "RunNotes"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = run_hash

        self.render()


class Plotly(Component):
    def __init__(self, fig, key=None):
        component_type = "Plotly"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = fig.to_json()

        self.render()


class Slider(Component):
    def __init__(self, min, max, value, key=None):
        component_type = "Slider"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = value

        self.options = {
            "min": min,
            "max": max,
            "value": self.value
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"][0] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({
            "value": val.to_py()
        })


class TextInput(Component):
    def __init__(self, value, key=None):
        component_type = "TextInput"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = value

        self.options = {
            "value": self.value
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({
            "value": val
        })


class Select(Component):
    def __init__(self, value=None, values=None, options=[], key=None):
        component_type = "Select"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = value or values

        self.options = {
            "value": self.value,
            "values": self.values,
            "options": options
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    @property
    def values(self):
        return self.state["values"] if "values" in self.state else self.data

    async def on_change(self, key):
        if type(self.values) is list:
            if key in self.values:
                values = list(filter(lambda item: item != key, self.values))
            else:
                values = self.values + [key]

            self.set_state({
                "values": values
            })
        else:
            self.set_state({
                "value": key
            })


class Text(Component):
    def __init__(self, data, key=None):
        component_type = "Text"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = data

        self.render()


class Union(Component):
    def __init__(self, components, key=None):
        component_type = "Union"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        for i, elem in reversed(list(enumerate(current_layout))):
            for comp in components:
                if elem["key"] == comp.key:
                    del current_layout[i]

        self.data = []
        for comp in components:
            self.data = self.data + comp.data
            self.callbacks.update(comp.callbacks)

        def get_viz_for_type(type):
            for comp in components:
                if comp.data and comp.data[0] and comp.data[0]["type"] == type:
                    return comp.type

        self.type = get_viz_for_type

        self.render()


class Button(Component):
    def __init__(self, label=None, size=None, variant=None, color=None, key=None):
        component_type = "Button"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = ''

        self.options = {
            "size": size,
            "variant": variant,
            "color": color,
            "label": label | 'button',
        }

        self.callbacks = {
            "on_click": self.on_click
        }

        self.render()

    def on_click(self, event):
        # You can define the callback behavior here
        print("Button clicked")


class Switch(Component):
    def __init__(self, checked=None, size=None, defaultChecked=None, disabled=None, key=None):
        component_type = "Switch"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type)

        self.data = checked

        self.options = {
            "size": size,
            "defaultChecked": defaultChecked,
            "disabled": disabled,
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    async def on_change(self, val):
        # You can define the callback behavior here
        self.set_state({
            "data": val
        })
        print("Switch" + str(val))
