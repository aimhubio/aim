def track_params_dists(model, run):
    from aim import Distribution
    data_hist = get_model_layers(model, 'data')

    for name, params in data_hist.items():
        if 'weight' in params:
            run.track(
                Distribution(params['weight']),
                name=name,
                context={
                    'type': 'data',
                    'params': 'weights',
                }
            )
        if 'bias' in params:
            run.track(
                Distribution(params['bias']),
                name=name,
                context={
                    'type': 'data',
                    'params': 'biases',
                }
            )


def track_gradients_dists(model, run):
    from aim import Distribution
    grad_hist = get_model_layers(model, 'grad')

    for name, params in grad_hist.items():
        if 'weight' in params:
            run.track(
                Distribution(params['weight']),
                name=name,
                context={
                    'type': 'gradients',
                    'params': 'weights',
                }
            )
        if 'bias' in params:
            run.track(
                Distribution(params['bias']),
                name=name,
                context={
                    'type': 'gradients',
                    'params': 'biases',
                }
            )


def get_model_layers(model, dt, parent_name=None):
    layers = {}
    for name, m in model.named_children():
        layer_name = '{}__{}'.format(parent_name, name) \
            if parent_name \
            else name
        layer_name += '.{}'.format(type(m).__name__)

        if len(list(m.named_children())):
            layers.update(get_model_layers(m, dt, layer_name))
        else:
            layers[layer_name] = {}
            if hasattr(m, 'weight') \
                    and m.weight is not None \
                    and hasattr(m.weight, dt):
                layers[layer_name]['weight'] = get_pt_tensor(getattr(m.weight, dt)).numpy()

            if hasattr(m, 'bias') \
                    and m.bias is not None \
                    and hasattr(m.bias, dt):
                layers[layer_name]['bias'] = get_pt_tensor(getattr(m.bias, dt)).numpy()

    return layers


# Move tensor from GPU to CPU
def get_pt_tensor(t):
    return t.cpu() if hasattr(t, 'is_cuda') and t.is_cuda else t
