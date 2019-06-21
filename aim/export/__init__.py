import torch
import torch.onnx
import torch.onnx.utils
from aim.engine.aim_model import AimModel

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
    model = AimModel()
    model.set_meta(metadata)
    model.set_onnx(proto)
    model.serialize(dest, name)


# Iteration 1. Use PyTorch Tracing to save the onnx file of the model
    # Use 2-3 different architectures to test in .aim-test
# Iteration 2. Extend the onnx and save as .aim
# Iteration 3. improve the code structure for aim.export
# Iteration 4. go over the other parts such as origin and re-evaluate


# Model input shapes should be part of the metadata.
