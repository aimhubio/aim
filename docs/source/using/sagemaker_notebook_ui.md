## Run Aim UI on SageMaker Notebook instance.

Create a lifecycle configuration on your SageMaker Service.
Copy and past the [script](https://github.com/aimhubio/aim/blob/feature/notebook-extension-sagemaker-support/aim/scripts/sagemaker/on-start.sh) in your configuration's `Start Notebook` phase.

<img style="border: 1px solid #1d2253" src="https://user-images.githubusercontent.com/21033329/155378543-05e053da-0714-46d1-9db3-f791a5634f2b.png" />
For more information how to create a lifecycle configuration on AWS SageMaker Service, please go through the [Documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/notebook-lifecycle-config.html).

After creating a lifecycle configuration, attach it to your SageMaker instance and restart the instance.

It is possible to run this script manually from the terminal of your jupyter instance as well.

.. Note::
    **Why this script is used for?**

    The script will upgrade the `jupyter-server-proxy` package on your notebook instance.
    To access some port on your instance(i.e. open Aim UI) needs to go through the proxy, which will be created by the package you are going to upgrade.
    The installed version has some issues with proxying and POST requests, and Aim UI uses POST requests.
    Fore more information please go through the https://github.com/jupyterhub/jupyter-server-proxy/pull/328#issue-1145874348.

Next, once your notebook instance is restarted, install aim on your notebook.
```shell
$ pip isntall aim
```

Create a repository for your Aim logs. <br>
```shell
$ aim init
```

Initialize a new run and save some hyperparameters.
```python
from aim import Run

run = Run()

run['hparams'] = {
    'learning_rate': 0.001,
    'batch_size': 32,
}
```

.. note::
  Do not forget to call run.finalize() once the training is over which will finalize the run by indexing all the data.


### Using Terminal
```shell
$ aim up --base-path=/proxy/absolute/<your-port>/aim-sage
```

After running this command you will be able to open `<sagemker_instance>/proxy/absolute/<your-port>/aim-sage/` in browser.
The default port is `43800`.

It is possible to set `__AIM_PROXY_URL__` env variable, and `aim up` command will print the generated url for Aim UI.

To find your proxy url just copy your SageMaker URL and remove `/lab` postfix.

<img style="border: 1px solid #1d2253" src="https://user-images.githubusercontent.com/21033329/155392344-9b8897e0-2b2e-44b1-897a-6f80a5284e11.png"/>

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

<img style="border: 1px solid #1d2253" src="../_static/images/using/jupyter.png" />

The default port is `43801` for  notebook  extension to prevent confusions.
The `--port=<your-port>` argument is supported as well.

.. note::
   In notebook extension, the only mandatory argument is `--proxy-url` when using it on SageMaker.
