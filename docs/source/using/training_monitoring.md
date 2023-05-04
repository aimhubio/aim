## Notify on failed/stuck runs

Many things can cause the training process to fail or get stuck:
- hardware failure
- power outage
- programmatic error

At first, it may seem a relatively easy, however checking that everything is OK with the training run is proven
to be a non-trivial task. 

In some cases the training process may not even have a chance to notify about the failure. The process
could also be stuck due to
- network issues
- filesystem I/O issues
- etc

With this in mind, the following definition of failed process is used:

> *The Run is considered as failed if it hasn't reported any progress in a predefined time-interval.*

Once the progress is not reported for the given period of time, a notification will be sent to the enabled channels.

See how to set up the notification service and add notification channels [here](./notifications.html).

### Run progress reporting SDK

Aim SDK provides interface for reporting `Run` progress. The `Run` class has now two methods:
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

`report_progress()` takes an ETA (in seconds) of the next anticipated progress report call.

Detailed description of interfaces is available in aim [SDK reference](../refs/sdk.html#aim.sdk.run.Run.report_progress).

.. note::
   Additional grace period of 100s is enabled to compensate for possible hardware (e.g. filesystem) latency.
