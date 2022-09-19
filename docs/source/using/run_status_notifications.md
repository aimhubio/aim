## Monitoring and Notifications

### Overview

Starting from version `3.13` Aim provides a mechanism of detecting and reporting 
failed or stalled training runs. 

**Quick start**

These are the required steps in order to turn on the training run status notifications.

1. Configure notifiers. The notifier configuration is described in detail in [Configuring Notifiers](#configuring-notifiers) section.

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

### How it works

At first, it may seem a relatively easy task, however checking that everything is OK with the training run is proven
to be a non-trivial task. There are many ways the training runs can fail:
- hardware failure
- power outage
- programmatic error

In some cases the training process may not even have a chance to notify about the failure. The process
could also be stuck due to
- network issues
- filesystem I/O issues
- etc

With this in mind, the following definition of failed process is used:

> *The Run is considered as failed if it hasn't reported any progress in a predefined time-interval.*

Aim notifications service is comprised of the following components:

- Aim SDK methods to report run progress/finish.
- Aim watcher service. A service responsible for detecting and notifying about run failures.
- Notifier configuration CLI. Command line utility for configuring where and how you want to
receive notifications about training run status.
  
Below are the components described in more detail.

### Run progress reporting SDK

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

`report_progress()` takes an ETA (in seconds) of the next anticipated progress report call. However, the watcher
will not send notifications and allow additional grace period to compensate for possible FS latency.

Detailed description of interfaces is available in aim [SDK reference](../refs/sdk.html#aim.sdk.run.Run.report_progress)

### Aim watcher service

Aim watcher service constantly polls the `Repo` and keeps track of the training runs in progress. 
Once the new run is detected, the watcher will check if the next progress has been reported within promised 
time-interval. If not, the watcher will send the notification as specified by `Repo`'s notifiers configuration.
Assuming the notifiers are already configured, in order to start watcher service just run

```shell
aim-watcher --repo <AIM_REPO_PATH> start
```

### Configuring notifiers

In order to configure how the notifications should be received Aim provides a CLI to
add, remove, and switch on/off notifier configurations. 

In order to configure how notifications about training runs should be received Aim provides 
a [CLI tool](../refs/cli.html#aim-status-watcher-cli) to interactively choose and setup the notifiers.
Currently, following types of notifiers are supported:

- [Slack](#configuring-notifier-for-slack): to receive notifications as a message on a slack channel.
- [Workplace](#configuring-notifier-for-workplace): to receive notifications as a post in a workplace group.
- Logger: to echo notification text to watcher standard output.

The base command is:

```shell
aim-watcher notifiers add
```

Once notifier type is selected, the watcher will ask to fill-in the required inputs for that 
particular notifier.

`aim-watcher` allows configuring multiple notifiers in case you'd like to receive them in 
multiple channels at the same time. Once notifier configuration added, `aim-watcher` should be re-run, so
new configuration can take effect.

Next sections will describe the setup flow for each of them.

#### Configuring notifier for slack

*In order to execute the steps described below you must have admin permissions for Slack workspace.*

Here are the steps to configure Aim notifier for Slack.

1. Go to Slack API web [page](https://api.slack.com) and push "Create an app" button.
<img alt="Slack create app" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/slack_create_app.png">
   
2. Select "From scratch" and follow the steps.
3. Make sure Incoming Webhooks are active. This is the Slack API Aim will use to send
notifications.
<img alt="Slack enable webhook" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/slack_activate_webhook.png">
   
4. Create a new Webhook URL and copy to clipboard.
5. Run `aim-watcher notifiers add slack` and once prompted for Webhook url, paste the one copied 
in step 4.
6. *Optional* Change the training run failure message template.
7. Confirm setup.


#### Configuring notifier for workplace

*In order to execute steps described below, please make sure you have access to Workplace Admin panel*

Here are the steps to configure Aim notifier for Workplace.
1. Go to "Your workplace" Admin Panel
2. Select "Integrations" tab and press "Create custom integration"
<img alt="Workplace create integration" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/workplace_create_integration.png">
   
3. Follow the setup steps.
4. In the "Permissions" tab make sure "Manage group content" checkbox checked. 
<img alt="Workplace integration permissions" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/workplace_integration_permissions.png">

5. Select the group(s) where you want to receive notifications.
6. In the "Details" tab press "Create access token" and copy the generated access token.
7. Run `aim-watcher notifiers add workplace` and provide group ID and copied access token.
8. *Optional* Change the training run failure message template.
9. Confirm setup.

#### Enabling/disabling notifier configuration

Aim watcher CLI allows to temporarily disable or completely remove notifiers. Each notifier
configuration has unique auto-generated ID which can be used to manipulate the notifier.
In order to list available notifiers for the aim Repo:

```shell
aim-watcher --repo . notifiers list

> NOTIFIER ID                              TYPE       STATUS    
> 88bbacb3-159d-4ee2-8f33-180addd162f1     slack      enabled   
> 75fe529d-c060-4816-9cbb-246770cb8592     slack      disabled  
> 248821e4-2bf3-4aa9-857e-194bf3ab2f8a     logger     enabled   

```

You can disable notifier by given ID:
```shell
aim-watcher --repo . notifiers disable 88bbacb3-159d-4ee2-8f33-180addd162f1
```

and enable it back:
```shell
aim-watcher --repo . notifiers enable 88bbacb3-159d-4ee2-8f33-180addd162f1
```

In order to remove notifier configuration completely:
```shell
aim-watcher --repo . notifiers remove 88bbacb3-159d-4ee2-8f33-180addd162f1
```

Complete reference for aim-watcher CLI is available [here](../refs/cli.html#aim-status-watcher-cli).