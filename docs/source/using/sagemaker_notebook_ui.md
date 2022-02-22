## Run Aim UI on SageMaker Notebook instance.

Inject the configuration [script](https://github.com/aimhubio/aim/blob/feature/notebook-extension-sagemaker-support/aim/scripts/sagemaker/on-start.sh) into your notebook instance's lifecycle - `On start`  phase:

.. note::
  It is possible to run this script manually as well

Next, initialize a new run and save some hyperparameters:

```python
from aim import Run

run = Run()

run['hparams'] = {
    'learning_rate': 0.001,
    'batch_size': 32,
}
```

.. note::
Do not forget to call run.finalize() once the training is over.


### Using Terminal
```shell
$ aim up --base-path=/proxy/absolute/<your-port>/aim-sage
```

After running this command you will be able to open `<sagemker_instance>/proxy/absolute/<your-port>/aim-sage/` in browser.

.. note::
   The default port is `43800`.

It is possible to set `__AIM_PROXY_URL__` env variable, and `aim up` command will print the generated url, so you will be able to open the link in a browser tab.

i.e. `__AIM_PROXY_URL__` = `https://<instance>.notebook.<region>.sagemaker.aws`

### Using Notebook Extension

1. Load Aim extension for notebooks:

```jupyter
%load_ext aim
```

2. Run `%aim up` to open Aim UI in the notebook:

```jupyter
%aim up --proxy-url=https://<instance>.notebook.<region>.sagemaker.aws
```
 
Will load the Aim UI in an iframe and will print the proxy url under the loaded Aim UI, which is useful to open the url in a new browser tab.
  
.. note::
   In notebook extension, the only mandatory argument is `--proxy-url`.
   The default port is `43801` for  notebook  extension to prevent confusions and the `--port=<your-port>` argument is supported.
