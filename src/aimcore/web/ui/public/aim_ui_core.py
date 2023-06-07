####################
# Bindings for fetching Aim Objects
####################

from pyodide.ffi import create_proxy
from js import search, localStorage
import json
import hashlib


board_path = None


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


memoize_cache = {}


def memoize(func):
    def wrapper(*args, **kwargs):
        if func.__name__ not in memoize_cache:
            memoize_cache[func.__name__] = {}

        key = generate_key(args + tuple(kwargs.items()))

        if key not in memoize_cache[func.__name__]:
            memoize_cache[func.__name__][key] = func(*args, **kwargs)

        return memoize_cache[func.__name__][key]

    return wrapper


query_results_cache = {}


def query_filter(type_, query="", count=None, start=None, stop=None, isSequence=False):
    query_key = f'{type_}_{query}_{count}_{start}_{stop}'

    if query_key in query_results_cache:
        return query_results_cache[query_key]

    try:
        data = search(board_path, type_, query, count, start, stop, isSequence)
        data = create_proxy(data.to_py())
        items = []
        i = 0
        for item in data:
            d = item
            d["type"] = type_
            i = i + 1
            items.append(d)
        data.destroy()

        query_results_cache[query_key] = items

        return items
    except:  # noqa
        return []


class Sequence():
    @classmethod
    def filter(self, query="", count=None, start=None, stop=None):
        return query_filter('Sequence', query, count, start, stop, isSequence=True)


class Container():
    @classmethod
    def filter(self, query=""):
        return query_filter('Container', query, None, None, None, isSequence=False)


####################
# Bindings for visualizing data with data viz elements
####################


def find(obj, element):
    keys = element.split(".")
    rv = obj
    for key in keys:
        try:
            rv = rv[key]
        except:  # noqa
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


def update_viz_map(viz_type, key=None):
    if key is not None:
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


@memoize
def group(name, data, options, key=None):
    group_map = {}
    grouped_data = []
    items = deep_copy(data)
    for item in items:
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
                    str(opt) if type(opt) is not str else opt.replace(
                        "metric.", ""),
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


current_layout = []


saved_state_str = localStorage.getItem("app_state")

state = {}

if saved_state_str:
    state = json.loads(saved_state_str)


def set_state(update, board_path, persist=False):
    from js import setState

    if board_path not in state:
        state[board_path] = {}

    state[board_path].update(update)

    setState(state, board_path, persist)


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

    updateLayout(current_layout, data["board_path"])


class Element:
    def __init__(self, block=None):
        self.parent_block = block
        self.board_path = board_path


class Block(Element):
    def __init__(self, type_, data=None, block=None):
        super().__init__(block)
        block_context["current"] += 1
        self.block_context = {
            "id": block_context["current"],
            "type": type_
        }
        self.key = generate_key(self.block_context)

        self.data = data
        self.callbacks = {}
        self.options = {}

        self.render()

    def render(self):
        block_data = {
            "element": 'block',
            "block_context": self.block_context,
            "key": self.key,
            "parent_block": self.parent_block,
            "board_path": self.board_path,
            "data": self.data,
            "options": self.options,
            "callbacks": self.callbacks,
        }

        render_to_layout(block_data)

    def __enter__(self):
        ui.set_block_context(self.block_context)

    def __exit__(self, type, value, traceback):
        ui.set_block_context(None)


class Component(Element):
    def __init__(self, key, type_, block):
        super().__init__(block)
        self.state = {}
        self.key = key
        self.type = type_
        self.data = None
        self.callbacks = {}
        self.options = {}
        self.state = state[board_path][key] if board_path in state and key in state[board_path] else {
        }
        self.no_facet = True

    def set_state(self, value):
        should_batch = self.parent_block is not None and self.parent_block["type"] == "form"

        if should_batch:
            state_slice = state[self.board_path][
                self.parent_block["id"]
            ] if (self.board_path in state and self.parent_block["id"] in state[self.board_path]) else {}

            component_state_slice = state_slice[self.key] if self.key in state_slice else {
            }

            component_state_slice.update(value)

            state_slice.update({
                self.key: component_state_slice
            })

            set_state({
                self.parent_block["id"]: state_slice
            }, self.board_path)
        else:
            state_slice = state[self.board_path][
                self.key
            ] if (self.board_path in state and self.key in state[self.board_path]) else {}

            state_slice.update(value)

            set_state({
                self.key: state_slice
            }, self.board_path)

    def render(self):
        component_data = {
            "type": self.type,
            "key": self.key,
            "data": self.data,
            "callbacks": self.callbacks,
            "options": self.options,
            "parent_block": self.parent_block,
            "no_facet": self.no_facet,
            "board_path": self.board_path
        }

        component_data.update(self.state)

        render_to_layout(component_data)


class AimSequenceComponent(Component):
    def group(self, prop, value=[]):
        group_map, group_data = group(prop, self.data, value, self.key)

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


# AimSequenceVizComponents


class LineChart(AimSequenceComponent):
    def __init__(self, data, x, y, color=[], stroke_style=[], options={}, key=None, block=None):
        component_type = "LineChart"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key)
        lines = []
        for i, item in enumerate(data):
            color_val = apply_group_value_pattern(
                color_map[color_data[i]["color"]]["order"], colors
            )
            stroke_val = apply_group_value_pattern(
                stroke_map[stroke_data[i]["stroke_style"]
                           ]["order"], stroke_styles
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

    async def on_active_point_change(self, point, is_active):
        if point is not None:
            item = self.data[point.key]

            if is_active:
                self.set_state({
                    "focused_line": item,
                    "focused_point": point,
                })
            else:
                self.set_state({
                    "active_line": item,
                    "active_point": point,
                })


class NivoLineChart(AimSequenceComponent):
    def __init__(self, data, x, y, color=[], stroke_style=[], options={}, key=None, block=None):
        component_type = "NivoLineChart"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key)
        lines = []
        for i, item in enumerate(data):
            color_val = apply_group_value_pattern(
                color_map[color_data[i]["color"]]["order"], colors
            )
            stroke_val = apply_group_value_pattern(
                stroke_map[stroke_data[i]["stroke_style"]
                           ]["order"], stroke_styles
            )

            line = dict(item)
            line["key"] = i
            line["data"] = {"xValues": find(item, x), "yValues": find(item, y)}
            line["color"] = color_val
            line["dasharray"] = stroke_val

            lines.append(line)

        self.data = lines
        self.options = options

        self.render()


class BarChart(AimSequenceComponent):
    def __init__(self, data, x, y, color=[], options={}, key=None, block=None):
        component_type = "BarChart"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        color_map, color_data = group("color", data, color, component_key)
        bars = []
        for i, item in enumerate(data):
            color_val = apply_group_value_pattern(
                color_map[color_data[i]["color"]]["order"], colors
            )

            bar = dict(item)
            bar["key"] = i

            x_value = find(item, x)
            if type(x_value) is list:
                x_value = x_value[-1]

            y_value = find(item, y)
            if type(y_value) is list:
                y_value = y_value[-1]

            bar["data"] = {"x": x_value, "y": y_value}
            bar["color"] = color_val

            bars.append(bar)

        self.data = bars
        self.options = options

        self.options.update({
            'x': x,
            'y': y
        })

        self.render()


class ScatterPlot(AimSequenceComponent):
    def __init__(self, data, x, y, color=[], stroke_style=[], options={}, key=None, block=None):
        component_type = "ScatterPlot"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key)
        lines = []
        for i, item in enumerate(data):
            color_val = apply_group_value_pattern(
                color_map[color_data[i]["color"]]["order"], colors
            )
            stroke_val = apply_group_value_pattern(
                stroke_map[stroke_data[i]["stroke_style"]
                           ]["order"], stroke_styles
            )

            line = dict(item)
            line["key"] = i
            line["data"] = {"xValues": find(item, x), "yValues": find(item, y)}
            line["color"] = color_val
            line["dasharray"] = stroke_val

            lines.append(line)

        self.data = lines
        self.options = options

        self.render()


class ParallelPlot(AimSequenceComponent):
    def __init__(self, data, dimensions='dimensions', values='values', color=[], stroke_style=[], options={}, key=None, block=None):
        component_type = "ParallelPlot"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key)
        lines = []
        for i, item in enumerate(data):
            color_val = apply_group_value_pattern(
                color_map[color_data[i]["color"]]["order"], colors)
            stroke_val = apply_group_value_pattern(
                stroke_map[stroke_data[i]["stroke_style"]]["order"], stroke_styles)

            line = dict(item)
            line["key"] = i
            line["data"] = {
                "dimensions": find(item, dimensions),
                "values": find(item, values)
            }
            line["color"] = color_val
            line["dasharray"] = stroke_val

            lines.append(line)

        self.data = lines
        self.options = options

        self.render()


class ImagesList(AimSequenceComponent):
    def __init__(self, data, key=None, block=None):
        component_type = "Images"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        images = []

        for i, item in enumerate(data):
            image = item
            image["key"] = i

            images.append(image)

        self.data = images

        self.render()


class AudiosList(AimSequenceComponent):
    def __init__(self, data, key=None, block=None):
        component_type = "Audios"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        audios = []

        for i, item in enumerate(data):
            audio = item
            audio["key"] = i

            audios.append(audio)

        self.data = audios

        self.render()


class TextsList(AimSequenceComponent):
    def __init__(self, data, color=[], key=None, block=None):
        component_type = "Texts"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

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


class FiguresList(AimSequenceComponent):
    def __init__(self, data, key=None, block=None):
        component_type = "Figures"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        figures = []

        for i, item in enumerate(data):
            figure = item
            figure["key"] = i

            figures.append(figure)

        self.data = figures

        self.render()


class Union(Component):
    def __init__(self, components, key=None, block=None):
        component_type = "Union"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

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


# DataDisplayComponents


class Plotly(Component):
    def __init__(self, fig, key=None, block=None):
        component_type = "Plotly"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = fig.to_json()

        self.render()


class JSON(Component):
    def __init__(self, data, key=None, block=None):
        component_type = "JSON"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = data

        self.render()


class DataFrame(Component):
    def __init__(self, data, key=None, block=None):
        component_type = "DataFrame"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = data.to_json(orient="records")

        self.render()


class Table(Component):
    def __init__(self, data, renderer=None, key=None, block=None):
        component_type = "Table"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = data

        self.callbacks = {
            "on_row_select": self.on_row_select,
            'on_row_focus': self.on_row_focus
        }
        self.options = {
            "data": data,
            "with_renderer": renderer is not None
        }

        if renderer:
            for col in renderer:
                cell_renderer = renderer[col]
                for i, cell_content in enumerate(data[col]):
                    cell = Block('table_cell', block=block)

                    cell.options = {
                        "table": component_key,
                        "column": col,
                        "row": i
                    }

                    cell.render()

                    with cell:
                        cell_renderer(cell_content)

        self.render()

    @property
    def selected_rows(self):
        return self.state["selected_rows"] if "selected_rows" in self.state else None

    @property
    def focused_row(self):
        return self.state["focused_row"] if "focused_row" in self.state else None

    async def on_row_select(self, val):
        self.set_state({"selected_rows": val.to_py()})

    async def on_row_focus(self, val):
        self.set_state({"focused_row": val.to_py()})


class HTML(Component):
    def __init__(self, data, key=None, block=None):
        component_type = "HTML"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = data

        self.render()


class Text(Component):
    def __init__(self, data, component=None, size=None, weight=None, color=None, mono=None, key=None, block=None):
        component_type = "Text"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = data

        self.options = {
            "component": component,
            "size": size,
            "weight": weight,
            "color": color,
            "mono": mono
        }

        self.render()


class Link(Component):
    def __init__(self, text, to, new_tab=False, key=None, block=None):
        component_type = "Link"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = to

        self.options = {
            "text": text,
            "to": to,
            "new_tab": new_tab
        }

        self.render()


# AimHighLevelComponents

class RunMessages(Component):
    def __init__(self, run_hash, key=None, block=None):
        component_type = "RunMessages"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = run_hash

        self.render()


class RunLogs(Component):
    def __init__(self, run_hash, key=None, block=None):
        component_type = "RunLogs"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = run_hash

        self.render()


class RunNotes(Component):
    def __init__(self, run_hash, key=None, block=None):
        component_type = "RunNotes"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = run_hash

        self.render()


class Explorer(Component):
    def __init__(self, name, query='', key=None, block=None):
        component_type = "Explorer"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = name

        self.options = {
            "query": query
        }

        self.render()

# InputComponents


def get_component_batch_state(key, parent_block=None):
    if parent_block is None:
        return None

    if board_path in state and parent_block["id"] in state[board_path]:
        if key in state[board_path][parent_block["id"]]:
            return state[board_path][parent_block["id"]][key]

    return None


class Slider(Component):
    def __init__(self, label, min, max, value, step=None, disabled=None, key=None, block=None):
        component_type = "Slider"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = value

        batch_state = get_component_batch_state(component_key, block)

        self.options = {
            "value": self.value if batch_state is None else batch_state["value"][0],
            "label": label,
            "min": min,
            "max": max,
            "step": self._get_step(self.data, step),
            "disabled": disabled,
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    def _get_step(self, initial_value, step):
        if (step):
            return step
        elif isinstance(initial_value, int):
            return 1
        elif isinstance(initial_value, float):
            return 0.01
        else:
            return None

    @property
    def value(self):
        return self.state["value"][0] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val.to_py()})


class RangeSlider(Component):
    def __init__(self, label, min, max, value, step=None, disabled=None, key=None, block=None):
        component_type = "RangeSlider"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = sorted(value, key=int)

        batch_state = get_component_batch_state(component_key, block)

        self.options = {
            "value": self.value if batch_state is None else batch_state["value"],
            "label": label,
            "min": min,
            "max": max,
            "disabled": disabled,
            "step": self._get_step(self.data, step),
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    def _get_step(self, initial_range, step):
        if (step):
            return step
        elif all(isinstance(n, int) for n in initial_range):
            return 1
        elif any(isinstance(n, float) for n in initial_range):
            return 0.01
        else:
            return None

    @property
    def value(self):
        value_state = self.state["value"] if "value" in self.state else self.data
        return tuple(value_state)

    async def on_change(self, val):
        self.set_state({"value": tuple(val.to_py())})


class TextInput(Component):
    def __init__(self, value, key=None, block=None):
        component_type = "TextInput"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = value

        batch_state = get_component_batch_state(component_key, block)

        self.options = {
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class NumberInput(Component):
    def __init__(self, label, value, min=None, max=None, step=None, disabled=None, key=None, block=None):
        component_type = "NumberInput"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = value

        batch_state = get_component_batch_state(component_key, block)

        self.options = {
            "value": self.value if batch_state is None else batch_state["value"],
            "label": label,
            "min": min,
            "max": max,
            "step": self._get_step(self.value, step),
            "disabled": disabled
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    def _get_step(self, value, step):
        if (step):
            return step
        elif isinstance(value, int):
            return 1
        elif isinstance(value, float):
            return 0.01
        else:
            return None

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class Select(Component):
    def __init__(self, options=(), value=None, key=None, block=None):
        component_type = "Select"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.default = value

        batch_state = get_component_batch_state(component_key, block)

        self.options = {
            "isMulti": False,
            "value": self.value if batch_state is None else batch_state["value"],
            "options": options
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.default

    async def on_change(self, val, index):
        self.set_state({"value": val})


class MultiSelect(Component):
    def __init__(self, options=(), value=None, key=None, block=None):
        component_type = "Select"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.default = value

        batch_state = get_component_batch_state(component_key, block)

        self.options = {
            "isMulti": True,
            "value": self.value if batch_state is None else batch_state["value"],
            "options": options
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.default

    async def on_change(self, val, index):
        if type(self.value) is list:
            if val in self.value:
                value = list(filter(lambda item: item != val, self.value))
            else:
                value = self.value + [val]

            self.set_state({"value": value})


class Switch(Component):
    def __init__(self, checked=None, size=None, defaultChecked=None, disabled=None, key=None, block=None):
        component_type = "Switch"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

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

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class TextArea(Component):
    def __init__(self, value=None, size=None, resize=None, disabled=None, caption=None, key=None, block=None):
        component_type = "TextArea"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = value

        batch_state = get_component_batch_state(component_key, block)

        self.options = {
            "value": self.value if batch_state is None else batch_state["value"],
            "size": size,
            "resize": resize,
            "disabled": disabled,
            "caption": caption
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class Radio(Component):
    def __init__(self, label=None, options=(), index=0, orientation='vertical', disabled=None, key=None, block=None):
        component_type = "Radio"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.default = options[index]

        self.options = {
            "value": self.value,
            "label": label,
            "options": options,
            "orientation": orientation,
            "disabled": disabled,
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.default

    async def on_change(self, val):
        self.set_state({"value": val})


class Checkbox(Component):
    def __init__(self, checked=False, disabled=None, key=None, block=None):
        component_type = "Checkbox"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = checked

        self.options = {
            "disabled": disabled,
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class ToggleButton(Component):
    def __init__(self, left_value="On", right_value="Off", index=0, disabled=None, size=None, block=None, key=None):
        component_type = "ToggleButton"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.options = {
            "rightLabel": right_value,
            "leftLabel": left_value,
            "rightValue": right_value,
            "leftValue": left_value,
            "disabled": disabled,
            "size": size,
            "defaultValue": left_value if index == 0 else right_value,
        }

        self.callbacks = {
            "on_change": self.on_change
        }

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.options["defaultValue"]

    async def on_change(self, val):
        self.set_state({"value": val})


class TypographyComponent(Component):
    def __init__(self, text, component_type, options=None, key=None, block=None):
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = text
        self.options = options

        self.render()


class Header(TypographyComponent):
    def __init__(self, text, key=None, block=None):
        options = {
            "component": "h2",
            "size": "$9"
        }
        super().__init__(text, "Header", options, key, block)


class SubHeader(TypographyComponent):
    def __init__(self, text, key=None, block=None):
        options = {
            "component": "h3",
            "size": "$6"
        }
        super().__init__(text, "SubHeader", options, key, block)


class Code(Component):
    def __init__(self, text, language='python',  key=None, block=None):
        component_type = "Code"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = text
        self.options = {
            "language": language
        }

        self.render()


# Super components

class Board(Component):
    def __init__(self, path=None, state=None, block=None, key=None):
        component_type = "Board"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = path

        set_state(state or {}, path)

        self.render()

    def get_state(self):
        return state[self.data] if self.data in state else None


class BoardLink(Component):
    def __init__(self, path=None, text='Go To Board', new_tab=False, state=None, block=None, key=None):
        component_type = "BoardLink"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, block)

        self.data = path

        self.board_state = state

        self.options = {
            "text": text,
            "new_tab": new_tab
        }

        self.callbacks = {
            "on_navigation": self.on_navigation
        }

        self.render()

    def on_navigation(self):
        if self.board_state != None:
            set_state(self.board_state, self.data)


class UI:
    def __init__(self):
        self.block_context = None

    def set_block_context(self, block):
        self.block_context = block

    # layout elements
    def rows(self, count):
        rows = []
        for i in range(count):
            row = Row(block=self.block_context)
            rows.append(row)
        return rows

    def columns(self, count):
        cols = []
        for i in range(count):
            col = Column(block=self.block_context)
            cols.append(col)
        return cols

    def tabs(self, names):
        tabs = Tabs(names, block=self.block_context)
        return tabs.tabs

    def form(self, *args, **kwargs):
        form = Form(*args, **kwargs, block=self.block_context)
        return form

    # input elements
    def text_input(self, *args, **kwargs):
        input = TextInput(*args, **kwargs, block=self.block_context)
        return input.value

    def number_input(self, *args, **kwargs):
        input = NumberInput(*args, **kwargs, block=self.block_context)
        return input.value

    def text_area(self, *args, **kwargs):
        textarea = TextArea(*args, **kwargs, block=self.block_context)
        return textarea.value

    def switch(self, *args, **kwargs):
        switch = Switch(*args, **kwargs, block=self.block_context)
        return switch.value

    def select(self, *args, **kwargs):
        select = Select(*args, **kwargs, block=self.block_context)
        return select.value

    def multi_select(self, *args, **kwargs):
        multi_select = MultiSelect(*args, **kwargs, block=self.block_context)
        return multi_select.value

    def slider(self, *args, **kwargs):
        slider = Slider(*args, **kwargs, block=self.block_context)
        return slider.value

    def range_slider(self, *args, **kwargs):
        range_slider = RangeSlider(*args, **kwargs, block=self.block_context)
        return range_slider.value

    def radio(self, *args, **kwargs):
        radio = Radio(*args, **kwargs, block=self.block_context)
        return radio.value

    def checkbox(self, *args, **kwargs):
        checkbox = Checkbox(*args, **kwargs, block=self.block_context)
        return checkbox.value

    def toggle_button(self, *args, **kwargs):
        toggle = ToggleButton(*args, **kwargs, block=self.block_context)
        return toggle.value

    # data display elements
    def text(self, *args, **kwargs):
        text = Text(*args, **kwargs, block=self.block_context)
        return text

    def plotly(self, *args, **kwargs):
        plotly_chart = Plotly(*args, **kwargs, block=self.block_context)
        return plotly_chart

    def json(self, *args, **kwargs):
        json = JSON(*args, **kwargs, block=self.block_context)
        return json

    def dataframe(self, *args, **kwargs):
        dataframe = DataFrame(*args, **kwargs, block=self.block_context)
        return dataframe

    def table(self, *args, **kwargs):
        table = Table(*args, **kwargs, block=self.block_context)
        return table

    def html(self, *args, **kwargs):
        html = HTML(*args, **kwargs, block=self.block_context)
        return html

    def link(self, *args, **kwargs):
        link = Link(*args, **kwargs, block=self.block_context)
        return link

    def header(self, *args, **kwargs):
        header = Header(*args, **kwargs, block=self.block_context)
        return header

    def subheader(self, *args, **kwargs):
        subheader = SubHeader(*args, **kwargs, block=self.block_context)
        return subheader

    def code(self, *args, **kwargs):
        code = Code(*args, **kwargs, block=self.block_context)
        return code

    # Aim sequence viz components
    def line_chart(self, *args, **kwargs):
        line_chart = LineChart(*args, **kwargs, block=self.block_context)
        return line_chart

    def nivo_line_chart(self, *args, **kwargs):
        nivo_line_chart = NivoLineChart(
            *args, **kwargs, block=self.block_context)
        return nivo_line_chart

    def bar_chart(self, *args, **kwargs):
        bar_chart = BarChart(*args, **kwargs, block=self.block_context)
        return bar_chart

    def scatter_plot(self, *args, **kwargs):
        scatter_plot = ScatterPlot(*args, **kwargs, block=self.block_context)
        return scatter_plot

    def parallel_plot(self, *args, **kwargs):
        parallel_plot = ParallelPlot(*args, **kwargs, block=self.block_context)
        return parallel_plot

    def images(self, *args, **kwargs):
        images = ImagesList(*args, **kwargs, block=self.block_context)
        return images

    def audios(self, *args, **kwargs):
        audios = AudiosList(*args, **kwargs, block=self.block_context)
        return audios

    def figures(self, *args, **kwargs):
        figures = FiguresList(*args, **kwargs, block=self.block_context)
        return figures

    def texts(self, *args, **kwargs):
        texts = TextsList(*args, **kwargs, block=self.block_context)
        return texts

    def union(self, *args, **kwargs):
        union = Union(*args, **kwargs, block=self.block_context)
        return union

    # Aim high level components
    def run_messages(self, *args, **kwargs):
        run_messages = RunMessages(*args, **kwargs, block=self.block_context)
        return run_messages

    def run_logs(self, *args, **kwargs):
        run_logs = RunLogs(*args, **kwargs, block=self.block_context)
        return run_logs

    def run_notes(self, *args, **kwargs):
        run_notes = RunNotes(*args, **kwargs, block=self.block_context)
        return run_notes

    def explorer(self, *args, **kwargs):
        explorer = Explorer(*args, **kwargs, block=self.block_context)
        return explorer

    # Super components
    def board(self, *args, **kwargs):
        board = Board(*args, **kwargs, block=self.block_context)
        return board

    def board_link(self, *args, **kwargs):
        board = BoardLink(*args, **kwargs, block=self.block_context)
        return board


class Row(Block, UI):
    def __init__(self, block=None):
        super().__init__('row', block=block)


class Column(Block, UI):
    def __init__(self, block=None):
        super().__init__('column', block=block)


class Tab(Block, UI):
    def __init__(self, label, block=None):
        super().__init__('tab', data=label, block=block)

        self.data = label


class Tabs(Block, UI):
    def __init__(self, labels, block=None):
        super().__init__('tabs', block=block)

        self.tabs = []
        for label in labels:
            tab = Tab(label, block=self.block_context)
            self.tabs.append(tab)


class Form(Block, UI):
    def __init__(self, submit_button_label='Submit', block=None):
        super().__init__('form', block=block)

        self.options = {
            'submit_button_label': submit_button_label
        }
        self.callbacks = {
            'on_submit': self.submit
        }

        self.render()

    def submit(self):
        batch_id = self.block_context["id"]
        state_update = state[board_path][batch_id]
        set_state(state_update, board_path=self.board_path)


ui = UI()
