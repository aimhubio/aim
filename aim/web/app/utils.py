import datetime
import json
import math
import pytz

from collections import namedtuple, OrderedDict


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


ModelField = namedtuple('ModelField', 'required, null, blank, source, type',
                        defaults=[False, True, True, None, None])


class ValidationError(Exception):
    pass


class SerializerMetaclass(type):
    """
    This metaclass sets a dictionary named `_declared_fields` on the class.
    Any instances of `ModelField` included as attributes on either the class
    or on any of its superclasses will be included in the
    `_declared_fields` dictionary.
    """

    @classmethod
    def _get_declared_fields(cls, bases, attrs):
        fields = [(field_name, attrs.pop(field_name))
                  for field_name, obj in list(attrs.items())
                  if isinstance(obj, ModelField)]
        fields.sort(key=lambda x: x[1]._creation_counter)

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


class BaseModelSerializer(metaclass=SerializerMetaclass):
    # TODO: write the docstring
    """
        Syntax for serializers, methods and that kind of stuff here
    """

    # error messages and templates
    FIELD_REQUIRED_ERROR_MESSAGE = 'This field is required.'
    FIELD_NULL_ERROR_MESSAGE = 'The value of this field can\'t be null.'
    FIELD_BLANK_ERROR_MESSAGE = 'The value of this field can\t be blank.'
    FIELD_WRONG_VALUE_ERROR_MESSAGE_TEMPLATE = 'This field must be of type {}, {} given.'

    def __init__(self, json_data=None, model_instance=None, model_class=None):
        self._model_instance = model_instance
        if not self._model_instance:
            self._model_instance = model_class()
        self._json_data = json_data
        self._error_messages = None
        self._validated_data = {}
        self._validated = False

    @property
    def validated_data(self):
        return self._validated_data

    @property
    def error_messages(self):
        return json.dumps(self._error_messages) if self._error_messages else None

    def validate(self, raise_exception=True):
        for field_name, field in self._declared_fields.items():  # derived from metaclass
            field_source = field.source if field.source else field_name
            try:
                value = self._json_data[field_source]
            except AttributeError:
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
                if field.type.hasattr('validate'):
                    # nested type validation
                    nested_serializer = field.type(json_data=value)
                    nested_serializer.validate(raise_exception=False)
                    if nested_serializer.error_messages:
                        self._error_messages[field_source] = nested_serializer.error_messages
                    else:
                        self._validated_data.update(nested_serializer.validated_data)
                else:
                    # native type check
                    if not isinstance(value, field.type):
                        self._error_messages[field_source] = BaseModelSerializer\
                            .FIELD_WRONG_VALUE_ERROR_MESSAGE_TEMPLATE\
                            .format(field.type, value.__class__.__name__)
                    else:
                        if field.type in (dict, list):
                            value = json.dumps(value)
                        self._validated_data[field_name] = value

        if raise_exception and self._error_messages:
            # raise the exception with json dumped version of error messages
            raise ValidationError(self.error_messages)

    def save(self):
        for field, field_value in self._validated_data.items():
            self._model_instance.setattribute(field, field_value)
        return self._model_instance
