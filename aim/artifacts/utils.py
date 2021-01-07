from collections.abc import Iterable, Mapping
import json
import re
from typing import Tuple, Any, Optional, Callable
import math

from aim.engine.utils import get_module


def get_pt_tensor(t):
    if hasattr(t, 'is_cuda') and t.is_cuda:
        return t.cpu()

    return t


def get_unique(a):
    np = get_module('numpy')
    s = set()
    unique = []
    for element in a:
        if element not in s:
            unique.append(element)
            s.add(element)
    return np.array(unique)


def validate_mapping(item: Mapping,
                     key_types: tuple,
                     value_types: tuple,
                     key_str_validator: Optional[str] = None,
                     iterable_validator: Optional[Callable] = None
                     ) -> Tuple[int, Any]:
    """
    Validates mapping items
    :returns: (int - status code;
               Any - invalid item, None otherwise)
    Status codes:
    0 - success
    1 - type error
    2 - format error
    """
    if not isinstance(item, Mapping):
        return 1, item

    for k, v in item.items():
        if not isinstance(k, key_types):
            return 1, k

        if key_str_validator is not None and isinstance(k, str):
            if not re.match(key_str_validator, k):
                return 2, k

        if not isinstance(v, value_types):
            return 1, v

        if isinstance(v, Mapping):
            mapping_v_res, mapping_v_res_item = validate_mapping(
                v,
                key_types,
                value_types,
                key_str_validator,
                iterable_validator)
            if mapping_v_res > 0:
                return mapping_v_res, mapping_v_res_item
        elif iterable_validator is not None \
                and not isinstance(v, str) and isinstance(v, Iterable):
            iter_v_res, iter_v_res_item = iterable_validator(v)
            if iter_v_res > 0:
                return 1, iter_v_res_item

    return 0, None


def validate_iterable(item: Iterable, types: tuple) -> Tuple[int, Any]:
    """
    Validates iterable items
    :returns: (int - status code;
               Any - invalid item, None otherwise)
    Status codes:
    0 - success
    1 - type error
    """
    if not isinstance(item, Iterable):
        return 1, item

    for v in item:
        if not isinstance(v, types):
            return 1, v

        if not isinstance(v, str) and isinstance(v, Iterable):
            iter_v_res, iter_v_res_item = validate_iterable(v, types)
            if iter_v_res > 0:
                return iter_v_res, iter_v_res_item

    return 0, None


def contains_inf_or_nan(item):
    # TODO: Check properly
    encoded = json.dumps(item)
    return 'Infinity' in encoded or 'NaN' in encoded


def format_floats(item):
    if isinstance(item, float) and math.isinf(item):
        return str(item)

    if isinstance(item, float) and math.isnan(item):
        return str(item)

    if isinstance(item, str):
        return item

    if isinstance(item, Mapping):
        item = dict(item)
        for k, v in item.items():
            item[k] = format_floats(v)
        return item

    if isinstance(item, Iterable):
        # TODO: Update implementation to not convert Iterable type to list
        item = list(item)
        for i in range(len(item)):
            item[i] = format_floats(item[i])
        return item

    return item


class TfUtils:
    # FIXME: statics as properties, and __init__(sess)

    @staticmethod    
    def get_tf_t_vars(sess):
        """Returns all trainable variables in the tf.session"""
        return sess.graph.get_collection("trainable_variables")

    @staticmethod
    def get_tf_t_vals(sess):
        """Returns all trainable values (parameters) in the tf.session"""
        return sess.run(
            TfUtils.get_tf_t_vars(sess)
            )

    @staticmethod
    def _is_op_defined(t_vars) -> bool:
        """Checks whether trainable variables are tf.Variables"""
        return all(t_var.name.startswith('Variable') for t_var in t_vars)

    @staticmethod
    def get_vals_hist(t_vals, num_bin):
        """Creates and returns hist"""
        np = get_module('numpy')
        t_vals_hist = np.histogram(t_vals, num_bin)
        return [t_vals_hist[0].tolist(),
                t_vals_hist[1].tolist(),
                ]

    @staticmethod
    def get_layers(t_vars):
        """Return the names of layers in net."""
        if TfUtils._is_op_defined(t_vars):
            return [t_var.name for t_var in t_vars][: len(t_vars) // 2]
        return get_unique([t_var.name.split('/')[0]
                           for t_var in t_vars
                           if '/' in t_var.name])

    @staticmethod
    def get_weights(t_vars, sess):
        """Given the session and trainable variables, returns weights"""
        if TfUtils._is_op_defined(t_vars):
            num_of_layers = len(TfUtils.get_layers(t_vars))
            return [sess.run(t_var) for t_var in t_vars[:num_of_layers]]
        return [sess.run(t_var) for t_var in t_vars if 'kernel' in t_var.name]

    @staticmethod
    def get_biases(t_vars, sess):
        """Given the seesion and trainable variables, returns biases"""
        if TfUtils._is_op_defined(t_vars):
            num_of_layers = len(TfUtils.get_layers(t_vars))
            return [sess.run(t_var) for t_var in t_vars[num_of_layers:]]
        return [sess.run(t_var) for t_var in t_vars if "bias" in t_var.name]
