import logging
import os

import lightgbm as lgb
import pandas as pd

from aim.lightgbm import AimCallback
from sklearn.metrics import mean_squared_error


def download_regression_dataset():
    url = 'https://raw.githubusercontent.com/microsoft/LightGBM/master/examples/regression/'
    train_file_name = 'regression.train'
    test_file_name = 'regression.test'

    train_ds_path = f'{url}{train_file_name}'
    test_ds_path = f'{url}{test_file_name}'

    try:
        os.system(f'wget -c {train_ds_path} -O {train_file_name}')
        os.system(f'wget -c {test_ds_path} -O {test_file_name}')
    except Exception as e:
        logging.info(f'Failed to download the dataset: {e}')

    return train_ds_path, test_ds_path


train_ds_path, test_ds_path = download_regression_dataset()

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

aim_callback = AimCallback(experiment_name='example_experiment', args=params)

logging.info('Starting training...')
# train
gbm = lgb.train(
    params,
    lgb_train,
    num_boost_round=20,
    valid_sets=lgb_eval,
    callbacks=[aim_callback, lgb.early_stopping(stopping_rounds=5)],
)

logging.info('Saving model...')
# save model to file
gbm.save_model('model.txt')

logging.info('Starting predicting...')
# predict
y_pred = gbm.predict(X_test, num_iteration=gbm.best_iteration)
# eval
rmse_test = mean_squared_error(y_test, y_pred) ** 0.5
logging.info(f'The RMSE of prediction is: {rmse_test}')
