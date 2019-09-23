import aim.engine.metadata as meta
import aim.export.pytorch as pt


def save_model(model_obj, metadata, dest, name):
    meta_props = meta.MetaValidate(metadata)
    meta_props.validate_metadata()

    if metadata[meta.ModelMetadata.FRAMEWORK] is meta.ModelMetadata.PYTORCH:
        pt.save_model(model_obj, metadata, dest, name)
