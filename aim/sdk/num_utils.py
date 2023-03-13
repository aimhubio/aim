def get_inst_type_str(inst):
    """
    Get instance type and class type full names
    """
    obj_name = obj_module = obj_cls_name = obj_cls_module = ''

    if hasattr(inst, '__name__'):
        obj_name = inst.__name__
    if hasattr(inst, '__module__'):
        obj_module = inst.__module__
    if hasattr(inst, '__class__'):
        if hasattr(inst.__class__, '__name__'):
            obj_cls_name = inst.__class__.__name__
        if hasattr(inst.__class__, '__module__'):
            obj_cls_module = inst.__class__.__module__

    obj_full = '{}.{}'.format(obj_name, obj_module)
    obj_cls_full = '{}.{}'.format(obj_cls_name, obj_cls_module)

    return obj_full, obj_cls_full


def get_inst_base_types(inst):
    """
    Get instance and it's base classes types
    """
    bases_types = []
    for b in inst.__class__.__bases__:
        b_type, b_cls_type = get_inst_type_str(b)
        bases_types.append(b_type)
        bases_types.append(b_cls_type)
    return bases_types


def inst_has_typename(inst, types):
    """
    Return `True` if the instance is created from class
    which has base that matches passed `types`
    """
    inst_type, inst_cls_type = get_inst_type_str(inst)
    inst_types = [inst_type, inst_cls_type] + get_inst_base_types(inst)

    for i in inst_types:
        found = True
        for t in types:
            if i.find(t) == -1:
                found = False
                break
        if found:
            return True

    return False


def is_pytorch_tensor(inst):
    """
    Check whether `inst` is instance of pytorch tensor
    """
    return inst_has_typename(inst, ['torch', 'Tensor'])


def is_tf_tensor(inst):
    return inst_has_typename(inst, ['tensorflow', 'Tensor'])


def is_jax_device_array(inst):
    """
    Check whether `inst` is instance of jax device array
    """
    if inst_has_typename(inst, ['jaxlib', 'xla_extension', 'Array']):
        return True
    if inst_has_typename(inst, ['jaxlib', 'xla_extension', 'DeviceArray']):
        return True
    return False


def is_numpy_array(inst):
    """
    Check whether `inst` is instance of numpy array
    """
    return inst_has_typename(inst, ['numpy', 'ndarray'])


def is_numpy_number(inst):
    """
    Check whether `inst` is numpy number
    """

    return inst_has_typename(inst, ['numpy'])


def is_py_number(value):
    return isinstance(value, (int, float))


def is_number(value):
    """
    Checks if the given value is a number
    """
    if is_py_number(value):
        return True

    if is_numpy_array(value):
        return True

    if is_numpy_number(value):
        return True

    if is_jax_device_array(value):
        return True

    if is_pytorch_tensor(value):
        return True

    if is_tf_tensor(value):
        return True

    return False


def convert_to_py_number(value) -> object:
    """
    Converts numpy objects or tensors to python number types
    """
    if isinstance(value, int):
        return int(value)

    if isinstance(value, float):
        return float(value)

    if is_numpy_array(value):
        return value.item()

    if is_numpy_number(value):
        return value.item()

    if is_jax_device_array(value):
        return value.item()

    if is_pytorch_tensor(value):
        return value.item()

    if is_tf_tensor(value):
        return value.numpy().item()

    raise ValueError('not a number')
