# The module is heavily based on `wrapt` package sources
# See: https://github.com/GrahamDumpleton/wrapt/blob/develop/src/wrapt/wrappers.py

from functools import lru_cache
import operator


def with_metaclass(meta, *bases):
    """Create a base class with a metaclass."""
    return meta("NewBase", bases, {})


class _ObjectProxyMethods(object):

    # We use properties to override the values of __module__ and
    # __doc__. If we add these in ObjectProxy, the derived class
    # __dict__ will still be setup to have string variants of these
    # attributes and the rules of descriptors means that they appear to
    # take precedence over the properties in the base class. To avoid
    # that, we copy the properties into the derived class type itself
    # via a meta class. In that way the properties will always take
    # precedence.

    @property
    def __module__(self):
        return self.__wrapped__().__module__

    @__module__.setter
    def __module__(self, value):
        self.__wrapped__().__module__ = value

    @property
    def __doc__(self):
        return self.__wrapped__().__doc__

    @__doc__.setter
    def __doc__(self, value):
        self.__wrapped__().__doc__ = value

    # We similar use a property for __dict__. We need __dict__ to be
    # explicit to ensure that vars() works as expected.

    @property
    def __dict__(self):
        return self.__wrapped__().__dict__

    # Need to also propagate the special __weakref__ attribute for case
    # where decorating classes which will define this. If do not define
    # it and use a function like inspect.getmembers() on a decorator
    # class it will fail. This can't be in the derived classes.

    @property
    def __weakref__(self):
        return self.__wrapped__().__weakref__


class _ObjectProxyMetaType(type):
    def __new__(cls, name, bases, dictionary):
        # Copy our special properties into the class so that they
        # always take precedence over attributes of the same name added
        # during construction of a derived class. This is to save
        # duplicating the implementation for them in all derived classes.

        dictionary.update(vars(_ObjectProxyMethods))

        return type.__new__(cls, name, bases, dictionary)


class Eager1:
    def __init__(self, wrapped, name):
        self.wrapped = lru_cache()(wrapped)
        self.name = name

    def __call__(self):
        w = self.wrapped()
        attr = getattr(w, self.name, Undefined())

        if not isinstance(attr, Undefined):
            return attr

        try:
            item = w[self.name]
            return item
        except KeyError:
            pass

        return Undefined()


class Eager2:
    def __init__(self, view, name):
        self.view = view
        self.name = name

    def __call__(self):
        w = self.view
        attr = getattr(w, self.name, Undefined())

        if not isinstance(attr, Undefined):
            return attr

        try:
            item = w[self.name]
            return item
        except KeyError:
            pass

        return Undefined()


class Eager3:
    def __init__(self, wrapped, key):
        self.wrapped = lru_cache()(wrapped)
        self.key = key

    def __call__(self):
        w = self.wrapped()

        try:
            item = w[self.key]
            return item
        except KeyError:
            pass

        return Undefined()


class Eager4:
    def __init__(self, view, key):
        self.view = view
        self.key = key

    def __call__(self):
        w = self.view

        try:
            item = w[self.key]
            return item
        except KeyError:
            pass

        return Undefined()


class AimObjectProxy(with_metaclass(_ObjectProxyMetaType)):

    @property
    def __name__(self):
        return self.__wrapped__().__name__

    @__name__.setter
    def __name__(self, value):
        self.__wrapped__().__name__ = value

    @property
    def __class__(self):
        return self.__wrapped__().__class__

    @__class__.setter # noqa
    def __class__(self, value):  # noqa
        self.__wrapped__().__class__ = value

    @property
    def __annotations__(self):
        return self.__wrapped__().__annotations__

    @__annotations__.setter
    def __annotations__(self, value):
        self.__wrapped__().__annotations__ = value

    def __dir__(self):
        return dir(self.__wrapped__())

    def __str__(self):
        return str(self.__wrapped__())

    def __bytes__(self):
        return bytes(self.__wrapped__())

    def __repr__(self):
        return '<{} at 0x{:x} for {} at 0x{:x}>'.format(
            type(self).__name__, id(self),
            type(self.__wrapped__()).__name__,
            id(self.__wrapped__()))

    def __reversed__(self):
        return reversed(self.__wrapped__())

    def __round__(self):
        return round(self.__wrapped__())

    def __mro_entries__(self, bases):
        return (self.__wrapped__(),)

    def __lt__(self, other):
        try:
            return self.__wrapped__() < other
        except TypeError:
            return False

    def __le__(self, other):
        try:
            return self.__wrapped__() <= other
        except TypeError:
            return False

    def __eq__(self, other):
        return self.__wrapped__() == other

    def __ne__(self, other):
        return self.__wrapped__() != other

    def __gt__(self, other):
        try:
            return self.__wrapped__() > other
        except TypeError:
            return False

    def __ge__(self, other):
        try:
            return self.__wrapped__() >= other
        except TypeError:
            return False

    def __hash__(self):
        return hash(self.__wrapped__())

    def __nonzero__(self):
        return bool(self.__wrapped__())

    def __bool__(self):
        return bool(self.__wrapped__())

    def __add__(self, other):
        return self.__wrapped__() + other

    def __sub__(self, other):
        return self.__wrapped__() - other

    def __mul__(self, other):
        return self.__wrapped__() * other

    def __div__(self, other):
        return operator.div(self.__wrapped__(), other)

    def __truediv__(self, other):
        return operator.truediv(self.__wrapped__(), other)

    def __floordiv__(self, other):
        return self.__wrapped__() // other

    def __mod__(self, other):
        return self.__wrapped__() % other

    def __divmod__(self, other):
        return divmod(self.__wrapped__(), other)

    def __pow__(self, other, *args):
        return pow(self.__wrapped__(), other, *args)

    def __lshift__(self, other):
        return self.__wrapped__() << other

    def __rshift__(self, other):
        return self.__wrapped__() >> other

    def __and__(self, other):
        return self.__wrapped__() & other

    def __xor__(self, other):
        return self.__wrapped__() ^ other

    def __or__(self, other):
        return self.__wrapped__() | other

    def __radd__(self, other):
        return other + self.__wrapped__()

    def __rsub__(self, other):
        return other - self.__wrapped__()

    def __rmul__(self, other):
        return other * self.__wrapped__()

    def __rdiv__(self, other):
        return operator.div(other, self.__wrapped__())

    def __rtruediv__(self, other):
        return operator.truediv(other, self.__wrapped__())

    def __rfloordiv__(self, other):
        return other // self.__wrapped__()

    def __rmod__(self, other):
        return other % self.__wrapped__()

    def __rdivmod__(self, other):
        return divmod(other, self.__wrapped__())

    def __rpow__(self, other, *args):
        return pow(other, self.__wrapped__(), *args)

    def __rlshift__(self, other):
        return other << self.__wrapped__()

    def __rrshift__(self, other):
        return other >> self.__wrapped__()

    def __rand__(self, other):
        return other & self.__wrapped__()

    def __rxor__(self, other):
        return other ^ self.__wrapped__()

    def __ror__(self, other):
        return other | self.__wrapped__()

    def __neg__(self):
        return -self.__wrapped__()

    def __pos__(self):
        return +self.__wrapped__()

    def __abs__(self):
        return abs(self.__wrapped__())

    def __invert__(self):
        return ~self.__wrapped__()

    def __int__(self):
        return int(self.__wrapped__())

    def __float__(self):
        return float(self.__wrapped__())

    def __complex__(self):
        return complex(self.__wrapped__())

    def __oct__(self):
        return oct(self.__wrapped__())

    def __hex__(self):
        return hex(self.__wrapped__())

    def __index__(self):
        return operator.index(self.__wrapped__())

    def __len__(self):
        return len(self.__wrapped__())

    def __contains__(self, value):
        return value in self.__wrapped__()

    def __iter__(self):
        return iter(self.__wrapped__())

    __slots__ = '__wrapped__', '__view__'

    def __init__(self, wrapped, view=None):
        object.__setattr__(self, '__wrapped__', wrapped)
        # print('__wrapped__()lazy__', wrapped)
        object.__setattr__(self, '__view__', view)

        # Python 3.2+ has the __qualname__ attribute, but it does not
        # allow it to be overridden using a property and it must instead
        # be an actual string object instead.

        try:
            object.__setattr__(self, '__qualname__', wrapped.__qualname__)
        except AttributeError:
            pass

    def __getattr__(self, name):
        # If we are being to lookup '__wrapped__()' then the
        # '__init__()' method cannot have been called.

        if name == '__wrapped__':
            raise ValueError('wrapper has not been initialised')

        if self.__view__ is None:
            return AimObjectProxy(Eager1(self.__wrapped__, name))

        return AimObjectProxy(
            Eager2(self.__view__, name),
            self.__view__.view(name)
        )

    def __getitem__(self, key):

        if self.__view__ is None:
            return AimObjectProxy(Eager3(self.__wrapped__, key))

        return AimObjectProxy(
            Eager4(self.__view__, key),
            self.__view__.view(key)
        )

    def __call__(self, *args, **kwargs):
        return self.__wrapped__()(*args, **kwargs)


class Undefined:
    def __bool__(self) -> bool:
        return False
