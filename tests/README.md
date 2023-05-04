# Testing

## Goals
Be able to test the correctness and performance of the
 - `aim engine`
 - `aim sdk`
 - `aim ql`
 - `extensions`

### Folder Structure

```
tests
  perf_tests/
    test_*.py
  unit_tests
    test_*.py
```

## Run
Run unit-tests via command `pytest tests/unit_tests` in the root folder.
Run performance tests via command `pytest tests/perf_tests` in the root folder.