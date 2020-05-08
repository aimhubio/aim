# Testing

## Goals
Be able to test the correctness of the
 - `aim sdk`
 - `*.aim` model file exported from training code

## Description
The env should be collection of files that export the models, run them, test them.

### Folder Structure

```
tests
  models
    {model_backend} (pytorch)
      {model_category}__{size} (cnn__sm)
        [model.py|train.py]
  test_*.py
```

## Run
Run tests via command `python -m unittest discover -s tests`