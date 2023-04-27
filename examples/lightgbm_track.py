from pathlib import Path

import pandas as pd
from sklearn.metrics import mean_squared_error
from aim.lightgbm import AimCallback

import lightgbm as lgb

print('Loading data...')
# load or create your dataset
regression_example_dir = Path(__file__).absolute().parent / 'regression'
train_ds_path = str(regression_example_dir / 'regression.train')
test_ds_path = str(regression_example_dir / 'regression.test')

if (
    not Path.is_dir(regression_example_dir)
    or not Path.is_file(Path(train_ds_path))
    or not Path.is_file(Path(test_ds_path))
):
    print(
        'Dataset is not found. '
        'Please download it from https://github.com/microsoft/LightGBM/tree/master/examples/regression'
    )
    exit()

df_train = pd.read_csv(train_ds_path, header=None, sep='\t')
df_test = pd.read_csv(test_ds_path, header=None, sep='\t')

y_train = df_train[0]
y_test = df_test[0]
X_train = df_train.drop(0, axis=1)
X_test = df_test.drop(0, axis=1)

# create dataset for lightgbm
lgb_train = lgb.Dataset(X_train, y_train)
lgb_eval = lgb.Dataset(X_test, y_test, reference=lgb_train)

# specify your configurations as a dict
params = {
    'boosting_type': 'gbdt',
    'objective': 'regression',
    'metric': ['l2', 'l1'],
    'num_leaves': 31,
    'learning_rate': 0.05,
    'feature_fraction': 0.9,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'verbose': 0,
}

aim_callback = AimCallback(experiment_name='lgb_test')

aim_callback.experiment['hparams'] = params

print('Starting training...')
# train
gbm = lgb.train(
    params,
    lgb_train,
    num_boost_round=20,
    valid_sets=lgb_eval,
    callbacks=[aim_callback, lgb.early_stopping(stopping_rounds=5)],
)

print('Saving model...')
# save model to file
gbm.save_model('model.txt')

print('Starting predicting...')
# predict
y_pred = gbm.predict(X_test, num_iteration=gbm.best_iteration)
# eval
rmse_test = mean_squared_error(y_test, y_pred) ** 0.5
print(f'The RMSE of prediction is: {rmse_test}')
