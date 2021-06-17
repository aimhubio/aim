import datetime
import json
import math
import os
import pytz

from flask import send_from_directory

from collections import OrderedDict
from collections.abc import Iterable


def datetime_now():
    return datetime.datetime.utcnow().replace(tzinfo=pytz.utc)


def normalize_type(val):
    if isinstance(val, str):
        if val == 'True':
            return True
        elif val == 'False':
            return False
        elif val == 'None':
            return None

        try:
            val = int(val)
        except:
            try:
                val = float(val)
            except:
                pass
    return val


def unsupported_float_type(value) -> bool:
    if not isinstance(value, (int, float)):
        return True

    if math.isinf(value):
        return True

    if math.isnan(value):
        return True

    return False

def send_from_directory_gzip_compressed(directory, filename, **options):
    compressed_filename = '{}.gz'.format(filename)
    if os.path.exists(os.path.join(directory, compressed_filename)):
        rv = send_from_directory(directory, compressed_filename, **options)
        rv.headers.add('Content-Encoding', 'gzip')
        return rv

    return send_from_directory(directory, filename, **options)

def json_loads_or_none(obj):
    return json.loads(obj) if obj else None


class Field:
    def __init__(self, type=None, source=None, required=False, null=True, blank=True):
        self.type = type
        self.source = source
        self.required = required
        self.null = null
        self.blank = blank


class ModelField(Field):
    pass


class ValidationError(Exception):
    pass


class SerializerMetaclass(type):
    """
    This metaclass sets a dictionary named `_declared_fields` on the class.
    Any instances of `Field` included as attributes on either the class
    or on any of its superclasses will be included in the
    `_declared_fields` dictionary.
    """

    @classmethod
    def _get_declared_fields(cls, bases, attrs):
        fields = [(field_name, attrs.pop(field_name))
                  for field_name, obj in list(attrs.items())
                  if isinstance(obj, (Field, ModelField))]

        # Ensures a base class field doesn't override cls attrs, and maintains
        # field precedence when inheriting multiple parents. e.g. if there is a
        # class C(A, B), and A and B both define 'field', use 'field' from A.
        known = set(attrs)

        def visit(name):
            known.add(name)
            return name

        base_fields = [
            (visit(name), f)
            for base in bases if hasattr(base, '_declared_fields')
            for name, f in base._declared_fields.items() if name not in known
        ]

        return OrderedDict(base_fields + fields)

    def __new__(cls, name, bases, attrs):
        attrs['_declared_fields'] = cls._get_declared_fields(bases, attrs)
        return super().__new__(cls, name, bases, attrs)


class BaseSerializer(metaclass=SerializerMetaclass):
    # error messages and templates
    FIELD_REQUIRED_ERROR_MESSAGE = 'This field is required.'
    FIELD_NULL_ERROR_MESSAGE = 'The value of this field can\'t be null.'
    FIELD_BLANK_ERROR_MESSAGE = 'The value of this field can\t be blank.'
    FIELD_WRONG_VALUE_ERROR_MESSAGE_TEMPLATE = 'This field must be of type {}, {} given.'

    def __init__(self, json_data=None):
        self._json_data = json_data if json_data else {}
        self._error_messages = {}
        self._validated_data = {}
        self._serialized_data = {}

    @property
    def validated_data(self):
        return self._validated_data

    @property
    def serialized_data(self):
        return self._serialized_data

    @property
    def error_messages(self):
        return self._error_messages

    def validate(self, raise_exception=False):
        for field_name, field in self._declared_fields.items():  # set by metaclass
            field_source = field.source if field.source else field_name
            try:
                value = self._json_data[field_source]
            except KeyError:
                # requirement check
                if field.required:
                    self._error_messages[field_source] = BaseModelSerializer.FIELD_REQUIRED_ERROR_MESSAGE
            else:
                # value checks
                if value is None:
                    # null check
                    if not field.null:
                        self._error_messages[field_source] = BaseModelSerializer.FIELD_NULL_ERROR_MESSAGE
                    else:
                        self._validated_data[field_name] = value
                        continue

                if value == '':
                    # blank check
                    if not field.blank:
                        self._error_messages[field_source] = BaseModelSerializer.FIELD_BLANK_ERROR_MESSAGE
                    else:
                        self._validated_data[field_name] = value
                        continue

                # type checks
                if hasattr(field.type, 'validate'):
                    # nested type validation
                    nested_serializer = field.type(json_data=value)
                    nested_serializer.validate()
                    if nested_serializer.error_messages:
                        self._error_messages[field_source] = nested_serializer.error_messages
                    else:
                        self._validated_data.update(nested_serializer.validated_data)
                else:
                    # native type check
                    if not isinstance(value, field.type):
                        self._error_messages[field_source] = BaseModelSerializer\
                            .FIELD_WRONG_VALUE_ERROR_MESSAGE_TEMPLATE\
                            .format(field.type, type(value))
                    else:
                        # check if the value needs to be dumped into json string
                        if isinstance(field.type, Iterable):
                            needs_json_dump = set(field.type).intersection({list, dict})
                        else:
                            needs_json_dump = field.type in (list, dict)
                        if needs_json_dump:
                            value = json.dumps(value)
                        self._validated_data[field_name] = value

        # finalize validation
        if self._error_messages:
            self._validated_data = {}
            if raise_exception:
                raise ValidationError(self._error_messages)

    def serialize(self, model_instance):
        for field_name, field in self._declared_fields.items():
            field_source = field.source if field.source else field_name
            if hasattr(field.type, 'serialized_data'):
                nested_serializer = field.type(model_instance)
                nested_serializer.serialize(model_instance)
                self._serialized_data[field_source] = nested_serializer.serialized_data
            else:
                value = getattr(model_instance, field_name)
                if isinstance(field.type, Iterable):
                    needs_json_load = set(field.type).intersection({list, dict})
                else:
                    needs_json_load = field.type in (list, dict)
                if needs_json_load:
                    value = json_loads_or_none(value)
                self._serialized_data[field_source] = value


class BaseModelSerializer(BaseSerializer):
    def __init__(self, model_instance, json_data=None):
        self._model_instance = model_instance
        super().__init__(json_data=json_data)

    def save(self):
        for field, field_value in self._validated_data.items():
            setattr(self._model_instance, field, field_value)
        return self._model_instance

    def serialize(self, model_instance=None):
        if not model_instance:
            model_instance = self._model_instance
        super().serialize(model_instance=model_instance)
