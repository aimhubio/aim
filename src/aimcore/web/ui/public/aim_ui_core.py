####################
# Bindings for fetching Aim Objects
####################

from js import search, runAction, findItem, clearQueryResultsCache, encodeURIComponent
import json
import hashlib


board_path = None
package_name = None


def deep_copy(obj):
    if isinstance(obj, (list, tuple)):
        return type(obj)(deep_copy(x) for x in obj)
    elif isinstance(obj, dict):
        return type(obj)((deep_copy(k), deep_copy(v)) for k, v in obj.items())
    elif isinstance(obj, set):
        return type(obj)(deep_copy(x) for x in obj)
    elif hasattr(obj, "__dict__"):
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


# Signals are being used to invalidate query results cache on specific state updates
# By binding queries and components with the same signal you can control when to invalidate query results cache
# You can use signals as primitive strings or as Signal class instances
# With Signal class, you can also specify properties that should be present in state update to invalidate query results cache

class Signal:
    signals_store = {}

    def __init__(self, name, properties=None):
        self.name = name
        self.properties = properties

        Signal.signals_store[self.name] = {
            "properties": self.properties,
            "query_keys": [],
        }

    @staticmethod
    def register(signal_name=None, query_key=None):
        """Binds query key to signal. When signal is dispatched, query results cache will be invalidated"""

        if (signal_name is not None) and (query_key is not None):
            if (signal_name not in Signal.signals_store):
                Signal.signals_store[signal_name] = {
                    "properties": None,
                    "query_keys": [query_key]
                }
            else:
                Signal.signals_store[signal_name]["query_keys"].append(query_key)

    @staticmethod
    def dispatch(signal_name=None, properties=None):
        """Dispatches signal. Cleares query results cache for all query keys bound to signal"""

        if signal_name is None:
            return

        signal = Signal.signals_store.get(signal_name, None)

        if signal is None:
            return

        signal_properties = signal.get("properties", None)

        if (
            (properties is not None) and
            (signal_properties is not None) and
            (not any(key in properties for key in signal_properties))
        ):
            return

        for key in signal.get("query_keys", []):
            clearQueryResultsCache(key)

        Signal.signals_store[signal_name]["query_keys"] = []


class WaitForQueryError(Exception):
    pass


# dict forbids setting attributes, hence using derived class
class dictionary(dict):
    pass


def process_properties(obj: dict):
    if '$properties' in obj:
        props = obj.pop('$properties')
        new_obj = dictionary()
        new_obj.update(obj)
        for k, v in props.items():
            setattr(new_obj, k, v)
        return new_obj
    return obj


# Iterator class for Aim Containers and Sequences which are being returned from filter methods
# e.g. Metric.filter("s.name == 'loss'")

class ItemListIterator:
    def __init__(self, items):
        self.items = items
        self.index = 0

    def __next__(self):
        if self.index < len(self.items):
            result = self.items[self.index]
            self.index += 1
            return result
        else:
            raise StopIteration

class ItemList:
    def __init__(self, items):
        self.items = items

    def __iter__(self):
        return ItemListIterator(self.items)
    
    def __len__(self):
        return len(self.items)
    
    def __getitem__(self, index):
        return self.items[index]


def query_filter(type_, query="", count=None, start=None, stop=None, is_sequence=False, signal=None):
    query_key = f"{type_}_{query}_{count}_{start}_{stop}"

    if (signal is not None):
        Signal.register(signal, query_key)

    if query_key in query_results_cache:
        return query_results_cache[query_key]

    try:
        data = search(board_path, type_, query, count, start, stop, is_sequence)

        if data is None:
            raise WaitForQueryError()

        data = ItemList(json.loads(data, object_hook=process_properties))

        query_results_cache[query_key] = data
        
        return data
    except Exception as e:
        if "WAIT_FOR_QUERY_RESULT" in str(e):
            raise WaitForQueryError()
        else:
            raise e


def run_action(action_name, params, signal=None):
    run_action_key = f"{action_name}_{json.dumps(params)}"

    if (signal is not None):
        Signal.register(signal, run_action_key)

    if run_action_key in query_results_cache:
        return query_results_cache[run_action_key]

    try:
        res = runAction(board_path, action_name, params)
        data = json.loads(res, object_hook=process_properties)["value"]

        query_results_cache[run_action_key] = data
        return data
    except Exception as e:
        if "WAIT_FOR_QUERY_RESULT" in str(e):
            raise WaitForQueryError()
        else:
            raise e


def find_item(type_, is_sequence=False, hash_=None, name=None, ctx=None, signal=None):
    if ctx is not None:
        ctx = json.dumps(ctx)
    
    query_key = f"{type_}_{hash_}_{name}_{ctx}"


    if (signal is not None):
        Signal.register(signal, query_key)

    if query_key in query_results_cache:
        return query_results_cache[query_key]

    try:
        data = findItem(board_path, type_, is_sequence, hash_, name, ctx)
        data = json.loads(data, object_hook=process_properties)

        query_results_cache[query_key] = data
        return data
    except Exception as e:
        if "WAIT_FOR_QUERY_RESULT" in str(e):
            raise WaitForQueryError()
        else:
            raise e

class Sequence:
    @classmethod
    def filter(self, query="", count=None, start=None, stop=None):
        return query_filter("Sequence", query, count, start, stop, is_sequence=True)
    
    @classmethod
    def find(self, hash_, name, context):
        return find_item("Sequence", is_sequence=True, hash_=hash_, name=name, ctx=context)


class Container:
    @classmethod
    def filter(self, query=""):
        return query_filter("Container", query, None, None, None, is_sequence=False)
    
    @classmethod
    def find(self, hash_):
        return find_item("Container", is_sequence=False, hash_=hash_)


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


current_layout = []

state = {}


def set_state(update, board_path, persist=True):
    from js import setState

    if board_path not in state:
        state[board_path] = {}

    state[board_path].update(update)

    for key in state[board_path]:
        if state[board_path][key] is None:
            del state[board_path][key]

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
        self.block_context = {"id": block_context["current"], "type": type_}
        self.key = generate_key(self.block_context)

        self.data = data
        self.callbacks = {}
        self.options = {}

        self.render()

    def render(self):
        block_data = {
            "element": "block",
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
    def __init__(self, key, type_, signal, block):
        super().__init__(block)
        self.key = key
        self.type = type_
        self.data = None
        self.callbacks = {}
        self.options = {}
        self.state = (
            state[board_path][key]
            if board_path in state and key in state[board_path]
            else {}
        )
        self.no_facet = True

        self.signal = signal

    def set_state(self, value, persist=True):
        should_batch = (
            self.parent_block is not None and self.parent_block["type"] == "form"
        )

        if should_batch:
            state_key = f'__form__{self.parent_block["id"]}'
            state_slice = (
                state[self.board_path][state_key]
                if (
                    self.board_path in state
                    and state_key in state[self.board_path]
                )
                else {}
            )

            component_state_slice = (
                deep_copy(state_slice[self.key]) if self.key in state_slice else {}
            )

            component_state_slice.update(value)

            state_slice.update({self.key: component_state_slice})

            set_state({state_key: state_slice}, self.board_path, persist=False)
        else:
            if self.signal is not None:
                Signal.dispatch(self.signal, list(value.keys()))

            state_slice = (
                state[self.board_path][self.key]
                if (self.board_path in state and self.key in state[self.board_path])
                else {}
            )

            state_slice.update(value)

            set_state({self.key: state_slice}, self.board_path, persist=persist)

    def render(self):
        component_data = {
            "type": self.type,
            "key": self.key,
            "component_key": self.key,
            "data": self.data,
            "callbacks": self.callbacks,
            "options": self.options,
            "parent_block": self.parent_block,
            "no_facet": self.no_facet,
            "board_path": self.board_path,
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
                color_val = apply_group_value_pattern(current["order"], colors)
                elem["color"] = color_val
                elem["color_val"] = current["val"]
                elem["color_options"] = value
            elif prop == "stroke_style":
                stroke_val = apply_group_value_pattern(current["order"], stroke_styles)
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
    def __init__(
        self, data, x, y, color=[], stroke_style=[], options={}, key=None, signal=None, block=None
    ):
        component_type = "LineChart"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key
        )
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
        self.callbacks = {"on_active_point_change": self.on_active_point_change}

        self.render()

    @property
    def focused_line(self):
        return self.state["focused_line"] if "focused_line" in self.state else None

    @property
    def focused_point(self):
        return self.state["focused_point"] if "focused_point" in self.state else None

    async def on_active_point_change(self, point, is_active):
        if point is not None:
            item = self.data[point.key]

            if is_active:
                self.set_state(
                    {
                        "focused_line": item,
                        "focused_point": point,
                    }
                )


class NivoLineChart(AimSequenceComponent):
    def __init__(
        self, data, x, y, color=[], stroke_style=[], options={}, key=None, signal=None, block=None
    ):
        component_type = "NivoLineChart"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key
        )
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

        self.render()


class BarChart(AimSequenceComponent):
    def __init__(self, data, x, y, color=[], options={}, key=None, signal=None, block=None):
        component_type = "BarChart"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

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

        self.options.update({"x": x, "y": y})

        self.render()


class ScatterPlot(AimSequenceComponent):
    def __init__(
        self, data, x, y, color=[], stroke_style=[], options={}, key=None, signal=None, block=None
    ):
        component_type = "ScatterPlot"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key
        )
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

        self.render()


class ParallelPlot(AimSequenceComponent):
    def __init__(
        self,
        data,
        dimensions="dimensions",
        values="values",
        color=[],
        stroke_style=[],
        options={},
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "ParallelPlot"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        color_map, color_data = group("color", data, color, component_key)
        stroke_map, stroke_data = group(
            "stroke_style", data, stroke_style, component_key
        )
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
            line["data"] = {
                "dimensions": find(item, dimensions),
                "values": find(item, values),
            }
            line["color"] = color_val
            line["dasharray"] = stroke_val

            lines.append(line)

        self.data = lines
        self.options = options

        self.render()


class ImagesList(AimSequenceComponent):
    def __init__(self, data, key=None, signal=None, block=None):
        component_type = "Images"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        images = []

        for i, item in enumerate(data):
            image = item
            image["key"] = i

            images.append(image)

        self.data = images

        self.render()


class AudiosList(AimSequenceComponent):
    def __init__(self, data, key=None, signal=None, block=None):
        component_type = "Audios"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        audios = []

        for i, item in enumerate(data):
            audio = item
            audio["key"] = i

            audios.append(audio)

        self.data = audios

        self.render()


class TextsList(AimSequenceComponent):
    def __init__(self, data, color=[], key=None, signal=None, block=None):
        component_type = "Texts"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

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
    def __init__(self, data, key=None, signal=None, block=None):
        component_type = "Figures"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        figures = []

        for i, item in enumerate(data):
            figure = item
            figure["key"] = i

            figures.append(figure)

        self.data = figures

        self.render()


class Union(Component):
    def __init__(self, components, key=None, signal=None, block=None):
        component_type = "Union"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

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
    def __init__(self, fig, key=None, signal=None, block=None):
        component_type = "Plotly"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # TODO: validate plotly figure
        # fig = validate(fig, dict, "fig")

        self.data = fig.to_json()

        self.render()


class JSON(Component):
    def __init__(self, data, key=None, signal=None, block=None):
        component_type = "JSON"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        # TODO validate data is a JSON

        self.data = data

        self.render()


class DataFrame(Component):
    def __init__(self, data, key=None, signal=None, block=None):
        component_type = "DataFrame"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        # TODO: validate data is a dataframe

        self.data = data.to_json(orient="records")

        self.render()


class Table(Component):
    def __init__(self, data, renderer={}, selectable_rows=False, key=None, signal=None, block=None):
        component_type = "Table"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        data = validate(data, dict, "data")
        renderer = validate(renderer, dict, "renderer")

        self.data = data

        self.callbacks = {
            "on_row_select": self.on_row_select,
            "on_row_focus": self.on_row_focus,
        }

        self.options = {
            "data": data,
            "with_renderer": renderer is not None,
            "selectable_rows": selectable_rows,
            "selected_rows_indices": self.selected_rows_indices,
            "focused_row_index": self.focused_row_index
        }

        if renderer:
            for col in renderer:
                cell_renderer = renderer[col]
                if col in data:
                    for i, cell_content in enumerate(data[col]):
                        cell = Block("table_cell", block=block)

                        cell.options = {"table": component_key, "column": col, "row": i}

                        cell.render()

                        with cell:
                            cell_renderer(cell_content)

        self.render()

    @property
    def selected_rows(self):
        if self.selected_rows_indices is None:
            return None
        
        rows = []

        for i in self.selected_rows_indices:
            row = {}

            for col in self.data:
                if i < len(self.data[col]):
                    row[col] = self.data[col][i]
                else:
                    row[col] = None
                

            rows.append(row)

        return rows

    @property
    def focused_row(self):
        if self.focused_row_index is None:
            return None
        
        row = {}

        idx = self.focused_row_index

        for col in self.data:
            if idx < len(self.data[col]):
                row[col] = self.data[col][idx]
            else:
                row[col] = None
        
        return row

    @property
    def selected_rows_indices(self):
        return self.state["selected_rows_indices"] if "selected_rows_indices" in self.state else None

    @property
    def focused_row_index(self):
        return self.state["focused_row_index"] if "focused_row_index" in self.state else None

    def on_row_select(self, val):
        selected_indices = val.to_py()
        self.set_state({"selected_rows_indices": selected_indices}, persist=False)

    def on_row_focus(self, val):
        self.set_state({"focused_row_index": val})


class Text(Component):
    def __init__(
        self,
        text,
        component="span",
        size="$3",
        weight="$2",
        color="$textPrimary",
        mono=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "Text"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        text = validate(text, str, "text")
        component = validate(component, str, "component")
        size = validate(size, str, "size")
        weight = validate(weight, str, "weight")
        color = validate(color, str, "color")
        mono = validate(mono, bool, "mono")

        self.data = text

        self.options = {
            "component": component,
            "size": size,
            "weight": weight,
            "color": color,
            "mono": mono,
        }

        self.render()


class Link(Component):
    def __init__(self, text, to, new_tab=False, key=None, signal=None, block=None):
        component_type = "Link"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        text = validate(text, str, "text")
        to = validate(to, str, "to")
        new_tab = validate(new_tab, bool, "new_tab")

        self.data = to

        self.options = {"text": text, "to": to, "new_tab": new_tab}

        self.render()


class TypographyComponent(Component):
    def __init__(self, text, component_type, options=None, key=None, signal=None, block=None):
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        self.data = text
        self.options = options

        self.render()


class Header(TypographyComponent):
    def __init__(self, text, key=None, signal=None, block=None):
        # validate all arguments passed in
        text = validate(text, str, "text")

        # set the properties/options for this component
        options = {"component": "h2", "size": "$9"}
        super().__init__(text, "Header", options, key, signal, block)


class SubHeader(TypographyComponent):
    def __init__(self, text, key=None, signal=None, block=None):
        # validate all arguments passed in
        text = validate(text, str, "text")

        # set the properties/options for this component
        options = {"component": "h3", "size": "$6"}
        super().__init__(text, "SubHeader", options, key, signal, block)


class Code(Component):
    def __init__(self, text, language="python", key=None, signal=None, block=None):
        component_type = "Code"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        text = validate(text, str, "text")
        language = validate(language, str, "language")

        self.data = text
        self.options = {"language": language}

        self.render()


class HTML(Component):
    def __init__(self, text, key=None, signal=None, block=None):
        component_type = "HTML"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        data = validate(text, str, "data")

        self.data = data

        self.render()


class Markdown(Component):
    def __init__(self, text, key=None, signal=None, block=None):
        component_type = "Markdown"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        data = validate(text, str, "data")

        self.data = data

        self.render()


# AimHighLevelComponents


class Explorer(Component):
    def __init__(self, name, query="", key=None, signal=None, block=None):
        component_type = "Explorer"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        self.data = name

        self.options = {"query": query}

        self.render()


# InputComponents


def get_component_batch_state(key, parent_block=None):
    if parent_block is None:
        return None

    if board_path in state and parent_block["id"] in state[board_path]:
        if key in state[board_path][parent_block["id"]]:
            return state[board_path][parent_block["id"]][key]

    return None


# validate value type, otherwise raise an exception


def validate(value, type_, prop_name):
    if not isinstance(type_, tuple):
        type_ = (type_,)
    for t in type_:
        if isinstance(value, t):
            return value
    raise Exception(f"Type of {prop_name} must be a {type_.__name__}")


# check if all elements in list are numbers, otherwise raise an exception


def validate_num_list(value):
    if all([isinstance(item, (int, float)) for item in value]):
        return value
    else:
        raise Exception("Value must be a list of numbers")


# check if all elements in tuple are numbers, otherwise raise an exception


def validate_num_tuple(value):
    if all([isinstance(item, (int, float)) for item in value]):
        return value
    else:
        raise Exception("Value must be a tuple of numbers")


class Slider(Component):
    def __init__(
        self,
        label="",
        value=10,
        min=0,
        max=100,
        step=None,
        disabled=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "Slider"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        value = validate(value, (int, float), "value")
        min = validate(min, (int, float), "min")
        max = validate(max, (int, float), "max")
        step = None if step is None else validate(step, (int, float), "step")
        disabled = validate(disabled, bool, "disabled")

        # set the initial data for this component
        self.data = value

        # set the properties/options for this component
        self.options = {
            "label": label,
            "min": min,
            "max": max,
            "disabled": disabled,
            "step": self._get_step(self.data, step),
            "value": self.value if batch_state is None else batch_state["value"][0],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    def _get_step(self, value, step):
        if step:
            return step
        elif isinstance(value, float):
            return 0.01
        else:
            return 1

    @property
    def value(self):
        return self.state["value"][0] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val.to_py()})


class RangeSlider(Component):
    def __init__(
        self,
        label="",
        value=(0, 10),
        min=0,
        max=100,
        step=None,
        disabled=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "RangeSlider"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        value = validate_num_tuple(value)
        min = validate(min, (int, float), "min")
        max = validate(max, (int, float), "max")
        step = None if step is None else validate(step, (int, float), "step")
        disabled = validate(disabled, bool, "disabled")

        # set the initial data for this component
        self.data = sorted(value, key=int)

        # set the properties/options for this component
        self.options = {
            "label": label,
            "min": min,
            "max": max,
            "disabled": disabled,
            "step": self._get_step(self.data, step),
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    def _get_step(self, value, step):
        if step is not None:
            return step
        elif any(isinstance(n, float) for n in value):
            return 0.01
        else:
            return 1

    @property
    def value(self):
        return tuple(self.state["value"] if "value" in self.state else self.data)

    async def on_change(self, val):
        self.set_state({"value": tuple(val.to_py())})


class TextInput(Component):
    def __init__(self, label="", value="", disabled=False, key=None, signal=None, block=None):
        component_type = "TextInput"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        value = validate(value, str, "value")
        disabled = validate(disabled, bool, "disabled")

        # set the initial data for this component
        self.data = value

        # set the properties/options for this component
        self.options = {
            "label": label,
            "disabled": disabled,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class NumberInput(Component):
    def __init__(
        self,
        label="",
        value=0,
        min=None,
        max=None,
        step=None,
        disabled=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "NumberInput"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        value = validate(value, (int, float), "value")
        min = None if min is None else validate(min, (int, float), "min")
        max = None if max is None else validate(max, (int, float), "max")
        step = None if step is None else validate(step, (int, float), "step")
        disabled = validate(disabled, bool, "disabled")

        # set the initial data for this component
        self.data = value

        # set the properties/options for this component
        self.options = {
            "label": label,
            "min": min,
            "max": max,
            "disabled": disabled,
            "step": self._get_step(self.value, step),
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    def _get_step(self, value, step):
        if step is not None:
            return step
        elif isinstance(value, float):
            return 0.01
        else:
            return 1

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class Select(Component):
    def __init__(
        self,
        label="",
        options=("option 1", "option 2"),
        index=0,
        searchable=None,
        disabled=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "Select"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        options = validate(options, (list, tuple), "options")
        index = validate(index, int, "index")
        disabled = validate(disabled, bool, "disabled")
        if searchable is not None:
            searchable = validate(searchable, bool, "searchable")
        else:
            searchable = len(options) > 10

        # set the initial data for this component
        self.data = options[index]

        # set the properties/options for this component
        self.options = {
            "label": label,
            "options": options,
            "disabled": disabled,
            "searchable": searchable,
            "isMulti": False,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class MultiSelect(Component):
    def __init__(
        self,
        label="",
        options=("option 1", "option 2"),
        index=[0],
        searchable=None,
        disabled=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "Select"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        options = validate(options, tuple, "options")
        index = validate(index, list, "index")
        disabled = validate(disabled, bool, "disabled")
        if searchable is not None:
            searchable = validate(searchable, bool, "searchable")
        else:
            searchable = len(options) > 10

        # set the initial data for this component
        self.data = [options[i] for i in index]

        # set the properties/options for this component
        self.options = {
            "label": label,
            "options": options,
            "disabled": disabled,
            "searchable": searchable,
            "isMulti": True,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        if isinstance(self.value, list):
            if val in self.value:
                value = list(filter(lambda item: item != val, self.value))
            else:
                value = self.value + [val]

            self.set_state({"value": value})


class Switch(Component):
    def __init__(
        self, label="", checked=False, size="md", disabled=False, key=None, signal=None, block=None
    ):
        component_type = "Switch"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        checked = validate(checked, bool, "checked")
        size = validate(size, str, "size")
        disabled = validate(disabled, bool, "disabled")

        # set the initial data for this component
        self.data = checked

        # set the properties/options for this component
        self.options = {
            "label": label,
            "size": size,
            "disabled": disabled,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class TextArea(Component):
    def __init__(
        self,
        label="",
        value="",
        size="md",
        resize="none",
        caption="",
        disabled=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "TextArea"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        value = validate(value, str, "value")
        size = validate(size, str, "size")
        resize = validate(resize, str, "resize")
        disabled = validate(disabled, bool, "disabled")
        caption = validate(caption, str, "caption")

        # set the initial data for this component
        self.data = value

        # set the properties/options for this component
        self.options = {
            "label": label,
            "size": size,
            "resize": resize,
            "disabled": disabled,
            "caption": caption,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class Radio(Component):
    def __init__(
        self,
        label="",
        options=("option 1", "option 2"),
        index=0,
        orientation="vertical",
        disabled=False,
        key=None,
        signal=None,
        block=None,
    ):
        component_type = "Radio"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        options = validate(options, tuple, "options")
        orientation = validate(orientation, str, "orientation")
        disabled = validate(disabled, bool, "disabled")
        index = validate(index, int, "index")

        # set the initial data for this component
        self.data = options[index]

        # set the properties/options for this component
        self.options = {
            "label": label,
            "options": options,
            "orientation": orientation,
            "disabled": disabled,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class Checkbox(Component):
    def __init__(self, label="", checked=False, disabled=False, key=None, signal=None, block=None):
        component_type = "Checkbox"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        checked = validate(checked, bool, "checked")
        label = validate(label, str, "label")
        disabled = validate(disabled, bool, "disabled")

        # set the initial data for this component
        self.data = checked

        # set the properties/options for this component
        self.options = {
            "label": label,
            "disabled": disabled,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


class ToggleButton(Component):
    def __init__(
        self,
        label="",
        left_value="On",
        right_value="Off",
        index=0,
        disabled=False,
        block=None,
        signal=None,
        key=None,
    ):
        component_type = "ToggleButton"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        batch_state = get_component_batch_state(component_key, block)

        # validate all arguments passed in
        label = validate(label, str, "label")
        rightValue = validate(right_value, str, "right_value")
        leftValue = validate(left_value, str, "left_value")
        index = validate(index, int, "index")
        disabled = validate(disabled, bool, "disabled")

        # set the initial data for this component
        self.data = right_value if index == 1 else left_value

        # set the properties/options for this component
        self.options = {
            "label": label,
            "disabled": disabled,
            "leftValue": leftValue,
            "rightValue": rightValue,
            "value": self.value if batch_state is None else batch_state["value"],
        }

        self.callbacks = {"on_change": self.on_change}

        self.render()

    @property
    def value(self):
        return self.state["value"] if "value" in self.state else self.data

    async def on_change(self, val):
        self.set_state({"value": val})


# Board components


class Board(Component):
    def __init__(self, path, state={}, key=None, signal=None, block=None):
        component_type = "Board"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        path = validate(path, str, "path")
        state = validate(state, dict, "state")

        self.data = path

        self.state_str = json.dumps(state)

        self.options = {
            "state_str": self.state_str,
            "package_name": package_name
        }

        self.render()

    def get_state(self):
        return state[self.data] if self.data in state else None


class BoardLink(Component):
    def __init__(
        self, path, text="Go To Board", new_tab=False, state={}, key=None, signal=None, block=None
    ):
        component_type = "BoardLink"
        component_key = update_viz_map(component_type, key)
        super().__init__(component_key, component_type, signal, block)

        # validate all arguments passed in
        path = validate(path, str, "path")
        text = validate(text, str, "text")
        new_tab = validate(new_tab, bool, "new_tab")
        state = validate(state, dict, "state")

        self.data = path

        self.board_state = state

        self.options = {
            "text": text, 
            "new_tab": new_tab,
            "package_name": package_name,
            "state_param": encodeURIComponent(json.dumps(state)) if state else None
        }

        self.render()



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
        if (len(args) > 0 and (args[0] is None)) or ("data" in kwargs and (kwargs["data"] is None)):
            text = Text('None', mono=True, block=self.block_context)
            return text
        
        json = JSON(*args, **kwargs, block=self.block_context)
        return json

    def dataframe(self, *args, **kwargs):
        dataframe = DataFrame(*args, **kwargs, block=self.block_context)
        return dataframe

    def table(self, *args, **kwargs):
        table = Table(*args, **kwargs, block=self.block_context)
        return table

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

    def html(self, *args, **kwargs):
        html = HTML(*args, **kwargs, block=self.block_context)
        return html

    def markdown(self, *args, **kwargs):
        markdown = Markdown(*args, **kwargs, block=self.block_context)
        return markdown

    # Aim sequence viz components
    def line_chart(self, *args, **kwargs):
        line_chart = LineChart(*args, **kwargs, block=self.block_context)
        return line_chart

    def nivo_line_chart(self, *args, **kwargs):
        nivo_line_chart = NivoLineChart(*args, **kwargs, block=self.block_context)
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

    # Board components
    def board(self, *args, **kwargs):
        board = Board(*args, **kwargs, block=self.block_context)
        return board

    def board_link(self, *args, **kwargs):
        board = BoardLink(*args, **kwargs, block=self.block_context)
        return board


class Row(Block, UI):
    def __init__(self, block=None):
        super().__init__("row", block=block)


class Column(Block, UI):
    def __init__(self, block=None):
        super().__init__("column", block=block)


class Tab(Block, UI):
    def __init__(self, label, block=None):
        super().__init__("tab", data=label, block=block)

        self.data = label


class Tabs(Block, UI):
    def __init__(self, labels, block=None):
        super().__init__("tabs", block=block)

        self.tabs = []
        for label in labels:
            tab = Tab(label, block=self.block_context)
            self.tabs.append(tab)


class Form(Block, UI):
    def __init__(self, submit_button_label="Submit", signal=None, block=None):
        super().__init__("form", block=block)

        self.signal = signal

        self.options = {"submit_button_label": submit_button_label}
        self.callbacks = {"on_submit": self.submit}

        self.render()

    def submit(self):
        if self.signal is not None:
            Signal.dispatch(self.signal)

        batch_id = f'__form__{self.block_context["id"]}'
        state_update = state[board_path].get(batch_id, {})
        set_state(state_update, board_path=self.board_path)


ui = UI()
