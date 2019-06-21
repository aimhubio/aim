from aim.engine.aim_model import AimModel


# export the onnx to model.aim
def export_onnx(onnx_proto, metadata, dest, name):
    # TODO: add model checks and other validations
    model = AimModel()
    model.set_meta(metadata)
    model.set_onnx(onnx_proto)
    model.serialize(dest, name)
