from functools import wraps


def exception_resistant(silent: bool):
    def inner(func):
        if not silent:
            num_fails = 0
            max_fails = 6

            @wraps(func)
            def wrapper(*args, **kwargs):
                nonlocal num_fails
                func_name = func.__name__
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    num_fails += 1
                    if num_fails == 1:
                        print('Something went wrong in `{}`. The process will continue to execute.'.format(func_name))
                    if num_fails <= max_fails:
                        print('`{}`: {}'.format(func_name, e))
                    elif num_fails == max_fails + 1:
                        print('The rest of the `{}` errors are hidden.'.format(func_name))
        else:
            @wraps(func)
            def wrapper(*args, **kwargs):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    pass
        return wrapper
    return inner
