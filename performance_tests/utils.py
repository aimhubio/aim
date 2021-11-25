import os
import time


def timing(iter_count=5):
    def inner(f):
        def wrapper(*args, **kwargs):
            ts = time.time()
            for _ in range(iter_count):
                f(*args, **kwargs)
            te = time.time()
            return (te-ts)/iter_count
        return wrapper
    return inner


def get_baseline_filename():
    import performance_tests
    performance_tests_path = os.path.dirname(performance_tests.__file__)
    baseline_filename = os.path.join(performance_tests_path, 'BASELINE')
    if os.environ.get('AIM_PERFORMANCE_TESTS_BASELINE'):
        # for local performance testing
        baseline_filename = os.environ['AIM_PERFORMANCE_TESTS_BASELINE']

    return baseline_filename


def get_baseline(test_name):
    filename = get_baseline_filename()
    if not os.path.exists(filename):
        return None

    with open(filename, 'r') as f:
        for line in f:
            if test_name in line:
                return float(line.split()[1])

    return None


def write_baseline(test_name, exec_time):
    filename = get_baseline_filename()

    with open(filename, 'a+') as f:
        f.write(f'{test_name} {exec_time}\n')
