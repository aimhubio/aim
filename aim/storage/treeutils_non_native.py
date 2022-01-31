from aim.storage.types import AimObject


def from_omegaconf_config(obj):
    try:
        from omegaconf import OmegaConf
    except ModuleNotFoundError:
        return obj, False

    if OmegaConf.is_config(obj):
        return OmegaConf.to_container(obj, resolve=True), True

    return obj, False


def convert_to_native_object(
    obj: AimObject,
    *,
    strict: bool = True,
):
    converters = [
        from_omegaconf_config
    ]
    for converter in converters:
        converted_obj, _success = converter(obj)
        if _success:
            obj = converted_obj
            break
    else:
        if not strict:
            return repr(obj)
        raise TypeError(f'Unhandled non-native value `{obj}` of type `{type(obj)}`.')

    return obj
