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


class KerasInterface(TensorFlowInterface):
    """
    Keras(only TF backend supported) interface for `Profiler` integration
    TODO: Add other backends support
    """

    keras = None

    label_layer_cls = None
    loop_layer_cls = None

    @classmethod
    def label(cls, key, **kwargs):
        cls._init()
        return cls.label_layer_cls(key)

    @classmethod
    def loop(cls, key, **kwargs):
        cls._init()
        return cls.label_layer_cls(key)

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

        # Implement `keras` layer wrapper for profiler `track` method
        if cls.label_layer_cls is None:
            class LabelLayer(cls.keras.layers.Layer):
                def __init__(self, key, **kwargs):
                    self.key = key
                    super(LabelLayer, self).__init__(**kwargs)

                def call(self, inp):
                    profiler_start_f = keras_interface.PROFILER_NODE_START
                    x = tf.py_function(
                        func=keras_interface._profiler_node(self.key,
                                                            profiler_start_f),
                        inp=[inp], Tout=inp.dtype)

                    # Set node shape
                    x.set_shape(inp.get_shape())
                    return x

                def compute_output_shape(self, input_shape):
                    return input_shape

            cls.label_layer_cls = LabelLayer

        # Implement `keras` layer wrapper for profiler `cycle` method
        if cls.loop_layer_cls is None:
            class LoopLayer(cls.keras.layers.Layer):
                def __init__(self, key, **kwargs):
                    self.key = key
                    super(LoopLayer, self).__init__(**kwargs)

                def call(self, inp):
                    profiler_end_f = keras_interface.PROFILER_NODE_END
                    x = tf.py_function(
                        func=keras_interface._profiler_node(self.key,
                                                            profiler_end_f),
                        inp=[inp], Tout=inp.dtype)

                    # Set node shape
                    x.set_shape(inp.get_shape())
                    return x

                def compute_output_shape(self, input_shape):
                    return input_shape

            cls.loop_layer_cls = LoopLayer
