from aim.storage.types import AimObject


def from_omegaconf_config(obj):
    try:
        from omegaconf import OmegaConf
    except ModuleNotFoundError:
        return

    if OmegaConf.is_config(obj):
        return OmegaConf.to_container(obj, resolve=True)


def convert_to_native_object(
    obj: AimObject,
    *,
    strict: bool = True,
):
    converters = [from_omegaconf_config]
    for func in converters:
        _obj = func(obj)
        if _obj is not None:
            obj = _obj
            break
    else:
        if not strict:
            obj = repr(obj)
        else:
            raise TypeError(
                f'Cannot store value of type {type(obj).__name__}. '
                f'Supported types are: None, bool, int, float, str, bytes, list, dict, and custom Aim objects. '
                f'Consider converting your value to a supported type (e.g., use .isoformat() for datetime objects). '
                f'Got: {type(obj).__module__}.{type(obj).__name__}'
            )

    return obj
