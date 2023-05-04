######
 MLOps
######


Activeloop Hub
--------------

Aim provides a wrapper object for ``hub.dataset``.
It allows storing the dataset info as a ``Run`` parameter and retrieving it later as any other ``Run`` parameter.
Here is an example of using Aim to log dataset info:

.. code-block:: python

    import hub
    from aim.sdk.objects.plugins.hub_dataset import HubDataset
    from aim.sdk import Run

    # create dataset object
    ds = hub.dataset('hub://activeloop/cifar100-test')

    # log dataset metadata
    run = Run(system_tracking_interval=None)
    run['hub_ds'] = HubDataset(ds)


DVC
----

If you are using `DVC <https://dvc.org/>`_ to version your datasets or track checkpoints / other large chunks of data, you can use Aim to record the info about the tracked files and datasets on Aim.
This will allow easily connecting your datasets info to the tracked experiments.
Here is how the code looks like

.. code-block:: python

    from aim.sdk import Run
    from aim.sdk.objects.plugins.dvc_metadata import DvcData

    run = Run(system_tracking_interval=None)

    path_to_dvc_repo = '.'
    run['dvc_info'] = DvcData(path_to_dvc_repo)

If we consider the following `sample repo <https://github.com/iterative/example-get-started>`_ provided by DVC team:

Run the following command to list repository contents, including files and directories tracked by DVC and by Git.

.. code-block:: console

    $ git clone https://github.com/iterative/example-get-started
    $ cd example-get-started
    $ dvc list .
    .dvcignore
    .github
    .gitignore
    README.md
    data
    dvc.lock
    dvc.yaml
    model.pkl
    params.yaml
    prc.json
    roc.json
    scores.json
    src

If we apply our previous code snippet on the same repo - we can observe the same information added to Run parameters.

.. code-block:: python

    {
        'dvc_info.dataset.source': 'dvc',
        'dvc_info.dataset.tracked_files': [
            '.dvcignore', '.github', '.gitignore',
            'README.md', 'data', 'dvc.lock',
            'dvc.yaml', 'model.pkl', 'params.yaml',
            'prc.json', 'roc.json', 'scores.json', 'src'
        ]
    }

Hugging Face Datasets
---------------------

Aim provides a wrapper object for ``datasets``.
It allows storing the dataset info as a ``Run`` parameter and retrieving it later as any other ``Run`` parameter.
Here is an example of using Aim to log dataset info:

.. code-block:: python

    from datasets import load_dataset
    from aim import Run
    from aim.hf_dataset import HFDataset

    # create dataset object
    dataset = load_dataset('rotten_tomatoes')

    # store dataset metadata
    run = Run()
    run['datasets_info'] = HFDataset(dataset)
