## Integration with XGboost

In the real world, there is a well-known handwritten digit recognition problem. In this article, we use the machine learning framework xgboost to help us train an image classification model. In this process, we will use Aim to track our experimental data.

Enjoy using aim to track xgboost experimental data only requires two simple steps:

Step 1: Explicitly import the AimCallback for tracking training data. 

```python
# call sdk aim.xgboost 
from aim.xgboost import AimCallback
```

Step 2: XGboost provides the xgboost.train method for model training, in which the callbacks parameter can call back data information from the outside. Here we pass in aimcallbacl designed for tracking data information

```python
xgboost.train(param, dtrain, num_round, watchlist,
                            callbacks=[AimCallback(experiment='xgboost_test')])
```

During the training process, you can start another terminal, in the same directory, start aim up, you can observe the information in real time.
