# Model Testing Environment

## Goals
Be able to test the correctness of the
  - `.aim` model file exported from training code

## Description
The env should be collection of files that export the models, run them, test them.
The developer should only enter the output tests and details about the model.
The rest should be executed by itself.

### Folder Structure

```
tests
  models
    {model_backend} (pytorch)
      {model_category} (seq2seq)
        [model.py|train.py]
```
