## Notify about run failures

Starting from version `3.13` Aim provides a mechanism of detecting and reporting 
failed or stalled training runs. 

**Quick start**

The following steps required to start receiving notifications about training run status:
1. Configure notifiers. The detailed description of the process is available in 
   [Configuring Notifiers section](using/configuring_notifiers.html)
2. Start notifier service:
    ```shell
    aim-watcher --repo <AIM_REPO_PATH> start
    ```
   
3. Integrate progress calls in your training loop:
    ```python
    from aim import Run
    aim_run = Run()
    for # training loop
        # forward pass
        ...
        # call report_progress with ETA of the next call
        aim_run.report_progress(expect_next_in=3) 
        ...
    
    # report finish
    aim_run.report_successful_finish()
    ```


While it may seem a relatively easy task, checking that
everything is OK with the training run proofed to be difficult to facilitate. There are
multiple definitions of training run not being OK and many reasons for that. Particularly, 
the training process may have no chance of notifying about failure, for example due to hardware
failure, power outage, etc. Moreover, even if the process is still alive, it can be stuck due to
other factors, such as network, filesystem I/O, etc. Therefore, the following definition of
failed process is used:

> *The Run considered to be failed if it hadn't reported any progress in the promised time.* 


### Components

Functionality of detecting and reporting failed runs is implemented by several components.
These components are:
- Aim SDK methods to report run progress/finish.
- Aim watcher service. A service responsible for detecting and notifying about run failures.
- Notifier configuration CLI. Command line utility for configuring where and how you want to
receive notifications about training run status.
  
Next sections will describe components one-by-one

#### Run progress reporting SDK

Aim SDK provides interface for reporting `Run` progress. The `Run` class has now two new methods:
`report_progress` and `report_successful_finish` to report progress and successful finish respectively.
Here's a small code snippet showing how `Run.report_progress()` method can be integrated in the training loop.
```python
from aim import Run

# prep dataset and model
...
aim_run = Run()

for epoch in range(num_epochs):
    for i, (images, labels) in enumerate(train_loader):
        images = images.to(device)
        labels = labels.to(device)

        # Forward pass
        outputs = model(images)
        loss = criterion(outputs, labels)
    
        # Report progress assuming each iteration shoud take less than 3 sec.
        aim_run.report_progress(expect_next_in=3)

        # Backward and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if i % 30 == 0:
            # Track data with aim
            aim_run.track(loss.item(), name='loss', epoch=epoch)

...
# Training is done, report success
aim_run.report_successful_finish()

```

#### Aim watcher service

Aim watcher service which is constantly polling the `Repo` and keeps track of the training
runs in progress. Once the new run is detected, watcher will check if the next progress
has been reported within the promised time, otherwise watcher will send notification as
specified by `Repo`'s notifiers configuration. Assuming the notifiers are already configured,
in order to start watcher service just run

```shell
aim-watcher --repo <AIM_REPO_PATH> start
```

#### Configuring notifiers

In order to configure how the notifications should be received Aim provides a CLI to
add, remove, and switch on/off notifier configurations. Currently, three types of
supported notifiers are:
- Workplace: to receive notifications as a post in a workplace group.
- Slack: to receive notifications as a message on a slack channel.
- Logger: to echo notification text to watcher standard output.

Next section describes notifiers configuration in depth.