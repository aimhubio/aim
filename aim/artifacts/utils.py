def get_pt_tensor(t):
    if hasattr(t, 'is_cuda') and t.is_cuda:
        return t.cpu()

    return t
