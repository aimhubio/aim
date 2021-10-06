<div align="center">

<img src="https://user-images.githubusercontent.com/13848158/97081166-8f568800-1611-11eb-991c-e9bc1344074e.png" height="95" />

**Aim logs your training runs, enables a beautiful UI to compare them and an API to query them programmatically.**

[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/aim-cli)](https://pypi.org/project/aim-cli/)
[![PyPI Package](https://img.shields.io/pypi/v/aim-cli?color=yellow)](https://pypi.org/project/aim-cli/)
[![Downloads](https://img.shields.io/docker/pulls/aimhubio/aim-board)](https://hub.docker.com/r/aimhubio/aim-board)
[![Issues](https://img.shields.io/github/issues/aimhubio/aim)](http://github.com/aimhubio/aim/issues)
[![License](https://img.shields.io/badge/License-Apache%202.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)

[![Follow on Twitter](https://img.shields.io/twitter/follow/aimstackio?style=social)](https://twitter.com/aimstackio)

---

<h3 align="center">
:tada:
Try out Aim at <a href="http://play.aimstack.io:43900/explore?search=eyJjaGFydCI6eyJzZXR0aW5ncyI6eyJwZXJzaXN0ZW50Ijp7InlTY2FsZSI6MCwiem9vbU1vZGUiOmZhbHNlLCJ6b29tSGlzdG9yeSI6W10sInBlcnNpc3RlbnQiOnsieVNjYWxlIjowLCJ6b29tTW9kZSI6ZmFsc2UsInpvb21IaXN0b3J5IjpbXSwicGVyc2lzdGVudCI6eyJ5U2NhbGUiOjAsInpvb21Nb2RlIjpmYWxzZSwiem9vbUhpc3RvcnkiOltdLCJwZXJzaXN0ZW50Ijp7ImRpc3BsYXlPdXRsaWVycyI6ZmFsc2UsInpvb20iOm51bGwsImludGVycG9sYXRlIjpmYWxzZX0sImRpc3BsYXlPdXRsaWVycyI6ZmFsc2UsImludGVycG9sYXRlIjp0cnVlLCJ6b29tIjp7IjAiOnsieCI6WzIuNjg1MTczMTQ4MTA1MzM4NSwzOF0sInkiOlszLjQ1NDEwMDA0ODU0MjAyMywzLjY4MjMzOTM5NzAxNzAyOF19LCIxIjp7IngiOlsyLjUzNzIwNjUxMzA3NzU1NywzOF0sInkiOlsyNy42NzE5Nzg3NjM2MTk2ODQsMzIuNTgxOTk5Nzc4NzQ3NTZdfSwiMiI6eyJ4IjpbNi4xMzAwNzcxODU4MDYzMzIsMjddLCJ5IjpbMy40MzIxNTAwNTM5Nzc5NjYsMy42NDc3MDkzNTA2NzM4NjZdfSwiMyI6eyJ4IjpbMy40OTA5MDg3NzA3OTQyNDE0LDI3XSwieSI6WzI5LjE0MjQ0OTMzOTY5ODA4MiwzMy43NzI5OTk5NTQyMjM2MzZdfSwiNCI6eyJ4IjpbNC42OTMxNjM4MzkzNzM3MDgsMjhdLCJ5IjpbMjkuNDA5MjQ3MjgyOTAwMjY0LDMyLjEwMzk5OTcxMDA4MzAxXX0sIjUiOnsieCI6WzYuOTQxMTk3MDgwOTUyMjg1LDI3LjA0MTk0NTU0NjY2ODI2XSwieSI6WzMuNDgxNjAwMDgxOTIwNjI0LDMuNTgyNzgzODQ4MDA3ODUzOF19fX0sInpvb20iOm51bGx9LCJ6b29tIjpudWxsLCJkaXNwbGF5T3V0bGllcnMiOmZhbHNlLCJpbnRlcnBvbGF0ZSI6dHJ1ZSwiYWdncmVnYXRlZCI6dHJ1ZX19LCJmb2N1c2VkIjp7ImNpcmNsZSI6eyJhY3RpdmUiOmZhbHNlLCJydW5IYXNoIjpudWxsLCJtZXRyaWNOYW1lIjpudWxsLCJ0cmFjZUNvbnRleHQiOm51bGwsInN0ZXAiOm51bGx9fX0sInNlYXJjaCI6eyJxdWVyeSI6ImJsZXUgaWYgY29udGV4dC5zdWJzZXQgPT0gdGVzdCBhbmQgaHBhcmFtcy5sZWFybmluZ19yYXRlID4gMC4wMDAwMSIsInYiOjF9LCJjb250ZXh0RmlsdGVyIjp7Imdyb3VwQnlDb2xvciI6WyJwYXJhbXMuaHBhcmFtcy5hbGlnbiIsInBhcmFtcy5ocGFyYW1zLm1heF9rIiwicGFyYW1zLmRhdGFzZXQucHJlcHJvYyJdLCJncm91cEJ5U3R5bGUiOltdLCJncm91cEJ5Q2hhcnQiOlsicGFyYW1zLmhwYXJhbXMuYWxpZ24iXSwiZ3JvdXBBZ2FpbnN0Ijp7ImNvbG9yIjpmYWxzZSwic3R5bGUiOmZhbHNlLCJjaGFydCI6ZmFsc2V9LCJhZ2dyZWdhdGVkQXJlYSI6Im1pbl9tYXgiLCJhZ2dyZWdhdGVkTGluZSI6ImF2ZyIsInNlZWQiOnsiY29sb3IiOjEwLCJzdHlsZSI6MTB9LCJwZXJzaXN0Ijp7ImNvbG9yIjpmYWxzZSwic3R5bGUiOmZhbHNlfSwiYWdncmVnYXRlZCI6dHJ1ZX19">play.aimstack.io</a>
:tada:
<br />
<br />
Join the Aim community on <a href="https://slack.aimstack.io">Slack</a>
</h3>

<br />
  
<img src="https://user-images.githubusercontent.com/13848158/136272428-44090e7e-d570-4bae-b58b-4115ab8a8061.gif" />

<br />

<h6 style="color: grey">Integrate seamlessly with your favorite tools</h6>

<img src="https://user-images.githubusercontent.com/13848158/96861310-f7239c00-1474-11eb-82a4-4fa6eb2c6bb1.jpg" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/96859323-6ba90b80-1472-11eb-9a6e-c60a90f11396.jpg" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/96861315-f854c900-1474-11eb-8e9d-c7a07cda8445.jpg" width="100" />

<br />

<img src="https://user-images.githubusercontent.com/13848158/97086626-8b3c6180-1635-11eb-9e90-f215b898e298.png" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/112145238-8cc58200-8bf3-11eb-8d22-bbdb8809f2aa.png" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/118172152-17c93880-b43d-11eb-9169-785e4b52d89c.png" width="100" />

</div>

Aim is open-source, self-hosted AI experiment tracking tool. Use Aim to deeply inspect hundreds of hyperparameter-sensitive training runs at once.

# Getting Started in 3 Steps

Follow the steps below to get started with Aim.

**1. Install Aim on your training environment**

_Prerequisite: You need to have python3 and pip3 installed in your environment before installing Aim_

```shell
$ pip install aim==3.0.0b6
```

**2. Integrate Aim with your code**

<details open>
<summary>
  Integrate your Python script
</summary>

```python
from aim import Run

# Initialize a new run
run = Run()

# Log run parameters
run["hparams"] = {
    "learning_rate": 0.001,
    "batch_size": 32,
}

# Log metrics
for step, sample in enumerate(train_loader):
    # ...
    run.track(loss_val, name='loss', step=step, epoch=epoch, context={ "subset": "train" })
    run.track(acc_val, name='acc', step=step, epoch=epoch, context={ "subset": "train" })
    # ...
```

_See documentation [here](#sdk-specifications)._

</details>

<details>
<summary>
  Integrate PyTorch Lightning
</summary>

```python
from aim.pytorch_lightning import AimLogger

# ...
trainer = pl.Trainer(logger=AimLogger(experiment='experiment_name'))
# ...
```

_See documentation [here](#pytorch-lightning)._

</details>

<details>
<summary>
  Integrate Hugging Face
</summary>

```python
from aim.hugging_face import AimCallback

# ...
aim_callback = AimCallback(repo='/path/to/logs/dir', experiment='mnli')
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset if training_args.do_train else None,
    eval_dataset=eval_dataset if training_args.do_eval else None,
    callbacks=[aim_callback],
    # ...
)
# ...
```

_See documentation [here](#hugging-face)._

</details>

<details>
<summary>
  Integrate Keras & tf.keras
</summary>

```python
import aim

# ...
model.fit(x_train, y_train, epochs=epochs, callbacks=[
    aim.keras.AimCallback(repo='/path/to/logs/dir', experiment='experiment_name')
    
    # Use aim.tensorflow.AimCallback in case of tf.keras
    aim.tensorflow.AimCallback(repo='/path/to/logs/dir', experiment='experiment_name')
])
# ...
```

_See documentation [here](#tensorflow-and-keras)._

</details>

<details>
<summary>
  Integrate XGBoost
</summary>

```python
from aim.xgboost import AimCallback

# ...
aim_callback = AimCallback(repo='/path/to/logs/dir', experiment='experiment_name')
bst = xgb.train(param, xg_train, num_round, watchlist, callbacks=[aim_callback])
# ...
```

_See documentation [here](#xgboost)._
</details>

**3. Run the training as usual and start Aim UI**

```shell
$ aim up
```
