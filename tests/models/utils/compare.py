import torch
"""
    Bunch of utilities that will perform comparisons and other tests
"""


# Compare python list to pytorch tensor
def pt_list_to_tensor_eq(py_list, pt_tensor):
    py_list_tensor = torch.tensor(py_list)
    return torch.equal(py_list_tensor, pt_tensor)
