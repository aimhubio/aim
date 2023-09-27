from aimstack.experiment_tracker import TrainingRun


def track_params_dists(model, run: TrainingRun):
    from aimstack.base import Distribution

    data_hist = get_model_layers(model, 'data')

    for name, params in data_hist.items():
        if 'weight' in params:
            run.get_distribution_sequence(
                name,
                {
                    'type': 'data',
                    'params': 'weights',
                },
            ).track(Distribution(params['weight']))
        if 'bias' in params:
            run.get_distribution_sequence(
                name,
                {
                    'type': 'data',
                    'params': 'biases',
                },
            ).track(Distribution(params['bias']))


def track_gradients_dists(model, run: TrainingRun):
    from aimstack.base import Distribution

    grad_hist = get_model_layers(model, 'grad')

    for name, params in grad_hist.items():
        if 'weight' in params:
            run.get_distribution_sequence(
                name,
                {
                    'type': 'gradients',
                    'params': 'weights',
                },
            ).track(Distribution(params['weight']))
        if 'bias' in params:
            run.get_distribution_sequence(
                name,
                {
                    'type': 'gradients',
                    'params': 'biases',
                },
            ).track(Distribution(params['bias']))


def get_model_layers(model, dt, parent_name=None):
    layers = {}
    for name, m in model.named_children():
        layer_name = '{}__{}'.format(parent_name, name) if parent_name else name
        layer_name += '.{}'.format(type(m).__name__)

        if len(list(m.named_children())):
            layers.update(get_model_layers(m, dt, layer_name))
        else:
            layers[layer_name] = {}
            weight = None
            if hasattr(m, 'weight') and m.weight is not None:
                weight = getattr(m.weight, dt, None)
                if weight is not None:
                    layers[layer_name]['weight'] = get_pt_tensor(weight).numpy()

            bias = None
            if hasattr(m, 'bias') and m.bias is not None:
                bias = getattr(m.bias, dt, None)
                if bias is not None:
                    layers[layer_name]['bias'] = get_pt_tensor(bias).numpy()

    return layers


# Move tensor from GPU to CPU
def get_pt_tensor(t):
    return t.cpu() if hasattr(t, 'is_cuda') and t.is_cuda else t
