# Model Testing Environment

## Goals
Be able to test the correctness of the
  - `.aim` model file exported from training code
  - docker container generated from the `aim deploy`
  - other executables for HW generated from `aim deploy`

## Description
The env should be collection of files that export the models, run them, test them.
The developer should only enter the output tests and details about the model.
The rest should be executed by itself.

### Folder Structure

```
test
  models
    general_model_category (seq2seq)
      tf_specific_seq2seq
      pt_specific_seq2seq
    another_model_category (resnet)
      tf_specific_resnet_1
      tf_specific_resnet_2
      pt_specific_resnet

    models_test.py (runs the tests from the folders)
```

models_test.py executes based on the prefixes of `"tf" (tensorflow)`, `"pt" (pytorch)` etc.
