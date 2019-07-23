import re
import os
import json
from io import StringIO

"""
    metadata.py is responsible for storing and managing the metadata
    properties passed during export.
    The validation and other property checking should be delegated to this
    module.
"""


class ModelMetadata():
    """
        an array of input shape arrays.
        example: [{'shape': ['*', 3, 2], type: 'float32'}]
            accepts one input of shape (*, 3, 2) where * means any >1 number
            type of the tensor is float32
    """
    INPUT = 'input'
    # input item property names
    INPUT_SHAPE = 'shape'
    INPUT_TYPE = 'type'
    # denotes the official name of the framework of the object
    # example: 'pytorch', 'tensorflow'
    FRAMEWORK = 'framework'
    # the framework version with which the model has been built
    FRAMEWORK_VERSION = 'framework_version'

    # Allowed name of the framework
    PYTORCH = 'pytorch'
    ALLOWED_FRAMEWORKS = [PYTORCH]
    ALLOWED_ATTRIBUTES = [INPUT, FRAMEWORK, FRAMEWORK_VERSION]
    ALLOWED_STRING_ATTRIBUTES = [FRAMEWORK, FRAMEWORK_VERSION]

    def __init__(self):
        # set the metadata properties initial dictionary
        self.props = {}
        self.meta_dict = None
        self.validator = None

    def __getitem__(self, name):
        # only return the allowed properties.
        if name not in ModelMetadata.ALLOWED_ATTRIBUTES:
            raise KeyError(
                'Attribute {} is missing from ModelMetadata'.format(name))
        else:
            return self.props[name]

    def __setitem__(self, name, value):
        # set the item only if it's allowed
        # silently ignore the rest of the attributes
        if name in ModelMetadata.ALLOWED_STRING_ATTRIBUTES:
            self.props[name] = value
        if name is ModelMetadata.INPUT:
            self.validator.validate_input(value)
            # make sure the input is set to Input instance.
            self.props[name] = list(map(lambda i: Input(i), value))

    def set_meta_dict(self, meta_dict):
        """
            Sets the metadata dictionary only if it's not set
            Initializes the properties.
        """
        if self.meta_dict is not None:
            raise ValueError(
                'The meta_dict already exists, please create new Metadata')
        elif meta_dict is not None:
            self.validator = MetaValidate(meta_dict)
            self.validator.validate_metadata()
            # set the metadata dictionary if it doesn't exist yet.
            self.meta_dict = meta_dict
            if self.meta_dict is not None:
                for k in self.meta_dict:
                    self.__setitem__(k, self.meta_dict[k])
        return self

    def serialize(self, path):
        dir, _ = os.path.split(path)
        metadata_dict = self.meta_dict
        if not os.path.exists(dir):
            os.makedirs(path)
        with open(path, 'w') as metadata_file:
            json.dump(metadata_dict, metadata_file)

    def serialize_stream(self):
        metadata_dict = self.meta_dict
        meta_io = StringIO()
        json.dump(metadata_dict, meta_io)
        return meta_io


class MetaValidate:
    """
        Handles validations and other checks for the metadata properties
    """

    def __init__(self, metadata):
        self.metadata = metadata

    def validate_metadata(self):
        self.validate_required()
        self.validate_input(self.metadata[ModelMetadata.INPUT])
        self.validate_framework()
        self.validate_framework_version()

    def validate_required(self):
        if ModelMetadata.FRAMEWORK not in self.metadata:
            raise ValueError(
                'Property \'{}\' is missing from metadata.'
                .format(ModelMetadata.FRAMEWORK))
        if ModelMetadata.INPUT not in self.metadata:
            raise ValueError(
                'Property \'{}\' is missing from metaedata.'
                .format(ModelMetadata.INPUT))

    def validate_input(self, input_val):
        if not isinstance(input_val, list):
            raise ValueError(
                'The provided \'{}\' is not an array.'
                .format(ModelMetadata.INPUT))

        if len(input_val) == 0:
            raise ValueError(
                'The provided \'{}\' array is empty'
                .format(ModelMetadata.INPUT))

        self._validate_input_items(input_val)

    def _validate_input_items(self, input_items):
        print('>>>> Validating Input Items --- TODO:')
        pass

    def validate_framework(self):
        if (self.metadata[ModelMetadata.FRAMEWORK]
                not in ModelMetadata.ALLOWED_FRAMEWORKS):
            raise ValueError(
                'The provided \'{}\' \'{}\' is not allowd'
                .format(ModelMetadata.FRAMEWORK,
                        self.metadata[ModelMetadata.FRAMEWORK]))

    def validate_framework_version(self):
        # TODO: do we even need this?
        pass


class Input:
    """
        Handles input related properties, types, shapes, validation
    """
    FLOAT = 'float32'
    INT = 'int'
    LONG = 'long'
    ALL_TYPES = [FLOAT, INT, LONG]

    def __init__(self, input_dict):
        self.input_dict = input_dict

    def validate_input_type(self):
        if (ModelMetadata.INPUT_TYPE in self.input_dict and
            len(self.input_dict[ModelMetadata.INPUT_TYPE]) > 0 and
            self.input_dict[ModelMetadata.INPUT_TYPE]
                not in Input.ALL_TYPES):
            raise ValueError('Input type is specified incorrectly.')

    def get_type(self):
        self.validate_input_type()
        if ModelMetadata.INPUT_TYPE not in self.input_dict:
            return Input.FLOAT
        else:
            return self.input_dict[ModelMetadata.INPUT_TYPE]

    def validate_input_shape(self):
        shape_regex = r'(^\*)|(?<![-.])\b[0-9]+\b(?!\.[0-9])'
        if ModelMetadata.INPUT_SHAPE not in self.input_dict:
            raise ValueError('Input is missing shape property')
        if not isinstance(self.input_dict[ModelMetadata.INPUT_SHAPE], list):
            raise ValueError('Input shape must be a list')
        for s in self.input_dict[ModelMetadata.INPUT_SHAPE]:
            rem = re.fullmatch(shape_regex, str(s))
            if rem is None:
                raise ValueError(
                    'The provided shape value {} is incorrect'.format(s))

    def get_input_shape(self):
        self.validate_input_shape()
        shape = []
        for s in self.input_dict[ModelMetadata.INPUT_SHAPE]:
            if s is '*':
                shape.append(s)
            else:
                shape.append(int(s))

        return shape
