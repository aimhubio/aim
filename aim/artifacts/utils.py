import numpy as np
import tensorflow as tf

from aim.sdk.track import track
from aim.sdk import checkpoint


def get_pt_tensor(t):
    if hasattr(t, 'is_cuda') and t.is_cuda:
        return t.cpu()

    return t

def get_unique(a):
    s = set()
    unique = []
    for element in a:
        if element not in s:
            unique.append(element)
            s.add(element)
    return np.array(unique)


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
        return all(t_var.name.startswith("Variable") for t_var in t_vars)

    @staticmethod
    def get_vals_hist(t_vals, num_bin):
        """Creates and returns hist"""
        t_vals_hist = np.histogram(t_vals, num_bin)
        return [ t_vals_hist[0].tolist(),
                 t_vals_hist[1].tolist(),
                 ]

    @staticmethod
    def get_layers(t_vars):
        """Return the names of layers in net."""
        if TfUtils._is_op_defined(t_vars):
            return [t_var.name for t_var in t_vars][: len(t_vars) // 2 ]
        return get_unique([t_var.name.split("/")[0] for t_var in t_vars if "/" in t_var.name])

    @staticmethod
    def get_weights(t_vars, sess):
        """Given the seesion and trainable variables, returns weights"""
        if TfUtils._is_op_defined(t_vars):
            num_of_layers = len(TfUtils.get_layers(t_vars))
            return [sess.run(t_var) for t_var in t_vars[ : num_of_layers]]
        return [sess.run(t_var) for t_var in t_vars if "kernel" in t_var.name]

    @staticmethod
    def get_biases(t_vars, sess):
        """Given the seesion and trainable variables, returns biases"""
        if TfUtils._is_op_defined(t_vars):
            num_of_layers = len(TfUtils.get_layers(t_vars))
            return [sess.run(t_var) for t_var in t_vars[num_of_layers : ]]
        return [sess.run(t_var) for t_var in t_vars if "bias" in t_var.name]


class CheckpointCallback(tf.keras.callbacks.Callback):
    """
    Custom callback for tracking checkpoints in Keras models.
    """

    def __init__(self, name, checkpoint_name, meta):
            super(CheckpointCallback, self).__init__()
            self.name = name
            self.checkpoint_name = checkpoint_name
            self.meta = meta

    def on_epoch_end(self, epoch, logs=None):
        """Tracks checkpoint at the end of each epoch"""
        if '{e}' in self.checkpoint_name:
            checkpoint_name = self.checkpoint_name.format(e=epoch)
        else:
            checkpoint_name = '{e}-{n}'.format(n=self.checkpoint_name,
                                               e=epoch)
        track(checkpoint, self.name, checkpoint_name,
              self.model, epoch, meta=self.meta)
