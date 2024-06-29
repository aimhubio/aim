import numpy as np
import pandas as pd

from aim.prophet import AimLogger
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error


# Generate synthetic time series data
np.random.seed(2019)
num_days = 5000
rng = pd.date_range('2000-01-01', freq='D', periods=num_days)
data = pd.DataFrame(  # Data format required by Prophet
    {'y': np.random.rand(num_days, 1).flatten(), 'ds': rng}  # target  # dates
)
train = data.iloc[:4000]
test = data.iloc[4000:]

model = Prophet()
logger = AimLogger(prophet_model=model, experiment_name='example_experiment')
model.fit(train)

future = model.make_future_dataframe(periods=1000)
preds = model.predict(future)


metrics = {
    'mse': mean_squared_error(test['y'], preds.iloc[4000:]['yhat']),
    'mae': mean_absolute_error(test['y'], preds.iloc[4000:]['yhat']),
}

logger.track_metrics(metrics)
