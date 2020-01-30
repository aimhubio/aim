from aim.profiler.profiler import Profiler
from aim.engine.utils import get_module


class BaseInterface:
    """
    Base interface for `Profiler` integration with various ML frameworks
    """

    def label(self, *args, **kwargs):
        raise NotImplementedError('method not implemented')

    def loop(self,  *args, **kwargs):
        raise NotImplementedError('method not implemented')


class DefaultInterface(BaseInterface):
    """
    Default interface
    """

    @classmethod
    def label(cls, key):
        p = Profiler()
        p.track(key)

    @classmethod
    def loop(cls, key):
        p = Profiler()
        p.cycle(key)


class TensorFlowInterface(BaseInterface):
    """
    TensorFlow interface for `Profiler` integration
    """

    PROFILER_NODE_START = 'start'
    PROFILER_NODE_END = 'end'

    tf = None
    profiler = None

    @classmethod
    def _profiler_node(cls, key, node_type):
        """
        Returns python function to be called in `py_function` TensorFlow op
        """
        def start(x):
            """
            Calls `Profiler` `track` method, which indicates loop start
            """
            cls.profiler.track(key)
            return x

        def end(x):
            """
            Calls `Profiler` `cycle` method, which indicates loop end
            """
            cls.profiler.cycle(key)
            return x

        if node_type == cls.PROFILER_NODE_START:
            return start
        elif node_type == cls.PROFILER_NODE_END:
            return end

    @classmethod
    def _init(cls):
        """
        Imports TensorFlow and creates `Profiler` object
        """
        if cls.tf is None:
            cls.tf = get_module('tensorflow')

        if cls.profiler is None:
            cls.profiler = Profiler()

    @classmethod
    def label(cls, key, inp):
        """
        Inserts node after `inp` node which will execute eagerly and
        call profiler `label` function. That tells `Profiler` to start
        tracking system statistics and collect them under `key` label
        """
        cls._init()
        tf = cls.tf

        # Create TensorFlow op which wraps python function and calls eagerly
        x = tf.py_function(
            func=cls._profiler_node(key, cls.PROFILER_NODE_START),
            inp=[inp], Tout=inp.dtype)

        # Set node shape
        x.set_shape(inp.get_shape())

        return x

    @classmethod
    def loop(cls, key, inp):
        """
        Inserts node after `inp` node which will execute eagerly and
        call profiler `loop` function. That tells `Profiler` to end
        tracking system statistics under `key` label and aggregate
        collected stats
        """
        cls._init()
        tf = cls.tf

        # Create TensorFlow op which wraps python function and calls eagerly
        x = tf.py_function(func=cls._profiler_node(key, cls.PROFILER_NODE_END),
                           inp=[inp], Tout=inp.dtype)

        # Set node shape
        x.set_shape(inp.get_shape())
        return x


class KerasInterface(BaseInterface):
    """
    Keras(only TF backend supported) interface for `Profiler` integration
    """

    pass
