import torch
import torch.onnx
import torch.onnx.utils
from aim.export.utils import export_onnx
import aim.engine.metadata as meta


def save_model(model_obj, metadata, dest, name):
    input_dicts = metadata[meta.ModelMetadata.INPUT]
    trace_input = _graph_args(input_dicts)
    model_obj.eval()
    graph, params, out = torch.onnx.utils._model_to_graph(
        model_obj, trace_input)
    # taken from torch.onnx.symbolic_helper.py
    _default_onnx_opset_version = 9
    opset_version = _default_onnx_opset_version
    proto, export_map = graph._export_onnx(
        params, opset_version, False,
        torch.onnx.OperatorExportTypes.ONNX, True)

    export_onnx(proto, metadata, dest, name)


def _get_input(input_dict):
    self = meta.Input(input_dict)
    input_shapes = self.get_input_shape()
    input_shapes_1 = []
    for i in input_shapes:
        if i is '*':
            input_shapes_1.append(1)
        else:
            input_shapes_1.append(i)
    input_type = self.get_type()
    vec = torch.rand(*input_shapes_1, requires_grad=True)
    # have ints between [0, 7)
    if input_type is meta.Input.INT:
        vec = (vec * 7).type(torch.IntTensor)
    elif input_type is meta.Input.LONG:
        vec = (vec * 7).type(torch.LongTensor)

    return vec


def _graph_args(input_dicts):
    args_list = list(map(lambda i: _get_input(i), input_dicts))
    if len(args_list) > 1:
        return tuple(args_list)
    else:
        return args_list[0]
