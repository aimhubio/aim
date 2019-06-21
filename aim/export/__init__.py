import torch
import torch.onnx
import torch.onnx.utils
from aim.export.utils import export_onnx

PYTORCH = 'pytorch'


def save_model(model_obj, metadata, dest, name):
    if 'framework' not in metadata:
        raise ValueError('Framework is not specified in metadata')
    framework = metadata['framework']
    if framework is not PYTORCH:
        raise ValueError('No framework is supported other than pytorch')
    if framework is PYTORCH:
        save_pytorch_model(model_obj, metadata, dest, name)


def save_pytorch_model(model_obj, metadata, dest, name):
    input_shape = metadata['input_shape']
    trace_input = torch.rand(*input_shape, requires_grad=True)
    model_obj.eval()
    # torch.onnx._export(
    #     model_obj, trace_input, path, export_params=True)

    graph, params, out = torch.onnx.utils._model_to_graph(
        model_obj, trace_input)
    proto, export_map = graph._export_onnx(params)
    export_onnx(proto, metadata, dest, name)
