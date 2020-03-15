import os

from aim.profiler.profiler import Profiler
from aim.engine.utils import get_module
from aim.engine.configs import AIM_PROFILER_ENABLED


class BaseInterface:
    """
    Base interface for `Profiler` integration with various ML frameworks
    """

    @staticmethod
    def enabled():
        """
        Returns `True` if Profiler is enabled and collects statistics
        or `False` otherwise
        """
        env = os.getenv(AIM_PROFILER_ENABLED)
        return env and env == 'true'

    def label(self, *args, **kwargs):
        raise NotImplementedError('method not implemented')

    def loop(self,  *args, **kwargs):
        raise NotImplementedError('method not implemented')

    def cycle(self,  *args, **kwargs):
        raise NotImplementedError('method not implemented')


class DefaultInterface(BaseInterface):
    """
    Default interface
    """

    @classmethod
    def label(cls, key):
        if cls.enabled():
            p = Profiler()
            p.label_tracking_start(key)

    @classmethod
    def loop(cls, key):
        if cls.enabled():
            p = Profiler()
            p.label_tracking_stop(key)

    @classmethod
    def cycle(cls):
        if cls.enabled():
            p = Profiler()
            p.cycle_end()


class TensorFlowInterface(BaseInterface):
    """
    TensorFlow interface for `Profiler` integration
    """

    PROFILER_NODE_START = 'start'
    PROFILER_NODE_END = 'end'
    PROFILER_NODE_CYCLE_END = 'cycle_end'

    tf = None
    profiler = None

    @classmethod
    def label(cls, key, inp, gradient=False):
        """
        Inserts node after `inp` node which will execute eagerly and
        call profiler `label_tracking_start` function. That tells `Profiler`
        to start tracking system statistics and collect them under `key` label.
        """
        # Return input if profiler is not enabled
        if not cls.enabled():
            return inp

        cls._init()
        tf = cls.tf

        # Create TensorFlow op which wraps python function and calls eagerly
        x = tf.py_function(func=cls._profiler_node(cls.PROFILER_NODE_START,
                                                   key),
                           inp=[inp], Tout=inp.dtype)

        if not gradient:
            x = tf.stop_gradient(x)

        # Set node shape
        x.set_shape(inp.get_shape())

        return x

    @classmethod
    def loop(cls, key, inp, gradient=False):
        """
        Inserts node after `inp` node which will execute eagerly and
        call profiler `label_tracking_stop` function. That tells `Profiler`
        to end tracking system statistics under `key` label and aggregate
        collected stats if auto detection mode of cycles is enabled.
        """
        # Return input if profiler is not enabled
        if not cls.enabled():
            return inp

        cls._init()
        tf = cls.tf

        # Create TensorFlow op which wraps python function and calls eagerly
        x = tf.py_function(
            func=cls._profiler_node(cls.PROFILER_NODE_END, key),
            inp=[inp], Tout=inp.dtype)

        if not gradient:
            x = tf.stop_gradient(x)

        # Set node shape
        x.set_shape(inp.get_shape())
        return x

    @classmethod
    def cycle(cls, inp):
        """
        Inserts node after `inp` node which will execute eagerly and call
        profiler `cycle_end` function, which will aggregate collected stats.
        This operation can be useful if auto detection mode of is disabled.
        """
        # Return input if profiler is not enabled
        if not cls.enabled():
            return inp

        cls._init()
        tf = cls.tf

        # Create TensorFlow op which wraps python function and calls eagerly
        x = tf.py_function(func=cls._profiler_node(cls.PROFILER_NODE_CYCLE_END),
                           inp=[inp], Tout=inp.dtype)

        # Set node shape
        x.set_shape(inp.get_shape())
        return x

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
    def _profiler_node(cls, node_type, key=None):
        """
        Returns python function that should be called within
        `py_function` TensorFlow operation
        """
        def start(x):
            """
            Calls `Profiler` `label_tracking_start` method,
            which indicates loop start
            """
            cls.profiler.label_tracking_start(key)
            return x

        def stop(x):
            """
            Calls `Profiler` `label_tracking_stop` method,
            which indicates loop end
            """
            cls.profiler.label_tracking_stop(key)
            return x

        def cycle(x):
            """
            Calls `Profiler` `cycle_end` method, which indicates a
            full cycle was done
            """
            cls.profiler.cycle_end()
            return x

        if node_type == cls.PROFILER_NODE_START:
            return start
        elif node_type == cls.PROFILER_NODE_END:
            return stop
        elif node_type == cls.PROFILER_NODE_CYCLE_END:
            return cycle


class KerasInterface(TensorFlowInterface):
    """
    Keras(only TF backend supported) interface for `Profiler` integration
    TODO: Add other backends support
    """

    keras = None

    _label_layer_cls = None
    _loop_layer_cls = None
    _cycle_layer_cls = None
    _neutral_layer_cls = None

    @classmethod
    def label(cls, key, gradient=True, **kwargs):
        if not cls.enabled():
            return cls._neutral_layer_cls()

        cls._init()
        return cls._label_layer_cls(key, gradient)

    @classmethod
    def loop(cls, key, gradient=True, **kwargs):
        if not cls.enabled():
            return cls._neutral_layer_cls()

        cls._init()
        return cls._loop_layer_cls(key, gradient)

    @classmethod
    def cycle(cls, **kwargs):
        if not cls.enabled():
            return cls._neutral_layer_cls()

        cls._init()
        return cls._cycle_layer_cls()

    @classmethod
    def _init(cls):
        """
        Import `keras` and implement keras wrapper
        """
        super()._init()

        # Import `keras`
        if cls.keras is None:
            cls.keras = get_module('keras')

        # Implement layers
        keras_interface = cls
        tf = cls.tf

        # Implement `keras` layer wrapper for profiler
        # `label_tracking_start` method
        if cls._label_layer_cls is None:
            class ProfilerLabelLayer(cls.keras.layers.Layer):
                def __init__(self, key, gradient, **kwargs):
                    self.key = key
                    self.gradient = gradient
                    super(ProfilerLabelLayer, self).__init__(**kwargs)

                def call(self, inp):
                    profiler_start_f = keras_interface.PROFILER_NODE_START
                    x = tf.py_function(
                        func=keras_interface._profiler_node(profiler_start_f,
                                                            self.key),
                        inp=[inp], Tout=inp.dtype)

                    if not self.gradient:
                        x = tf.stop_gradient(x)

                    # Set node shape
                    x.set_shape(inp.get_shape())
                    return x

                def compute_output_shape(self, input_shape):
                    return input_shape

            cls._label_layer_cls = ProfilerLabelLayer

        # Implement `keras` layer wrapper for profiler
        # `label_tracking_stop` method
        if cls._loop_layer_cls is None:
            class ProfilerLoopLayer(cls.keras.layers.Layer):
                def __init__(self, key, gradient, **kwargs):
                    self.key = key
                    self.gradient = gradient
                    super(ProfilerLoopLayer, self).__init__(**kwargs)

                def call(self, inp):
                    profiler_end_f = keras_interface.PROFILER_NODE_END
                    x = tf.py_function(
                        func=keras_interface._profiler_node(profiler_end_f,
                                                            self.key),
                        inp=[inp], Tout=inp.dtype)

                    if not self.gradient:
                        x = tf.stop_gradient(x)

                    # Set node shape
                    x.set_shape(inp.get_shape())
                    return x

                def compute_output_shape(self, input_shape):
                    return input_shape

            cls._loop_layer_cls = ProfilerLoopLayer

        # Implement `keras` layer wrapper for profiler `cycle_end` method
        if cls._cycle_layer_cls is None:
            class ProfilerCycleLayer(cls.keras.layers.Layer):
                def __init__(self, **kwargs):
                    super(ProfilerCycleLayer, self).__init__(**kwargs)

                def call(self, inp):
                    profiler_cycle_f = keras_interface.PROFILER_NODE_CYCLE_END
                    x = tf.py_function(
                        func=keras_interface._profiler_node(profiler_cycle_f),
                        inp=[inp], Tout=inp.dtype)

                    # Set node shape
                    x.set_shape(inp.get_shape())
                    return x

                def compute_output_shape(self, input_shape):
                    return input_shape

            cls._cycle_layer_cls = ProfilerCycleLayer

        # Implement `keras` layer that does nothing, but passes input
        # to the next layer. This layer is used when profiler is disabled.
        if cls._neutral_layer_cls is None:
            class ProfilerNeutralLayer(cls.keras.layers.Layer):
                def call(self, inp):
                    return tf.stop_gradient(inp)

                def compute_output_shape(self, input_shape):
                    return input_shape

            cls._neutral_layer_cls = ProfilerNeutralLayer
