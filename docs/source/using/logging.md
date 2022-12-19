## Log messages during training process

During the training many key events may happen. Use Aim logging API to log any text message.

Additionally, [set up the notification service](./notifications.html) to automatically send notifications, 
when a new message is logged.

### The logging API

Aim SDK provides an interface to log any string message in the “.aim” repo.

- **Run.log_debug(msg)** - aim.Run method to log a message with level `DEBUG`.
- **Run.log_info(msg)** - aim.Run method to log a message with level `INFO`.
- **Run.log_warning(msg)** - aim.Run method to log a message with level `WARNING`.
- **Run.log_error(msg)** - aim.Run method to log a message with level `ERROR`.

### Notifying on logged messages

Aim notification service constantly checks for new logged messages and sends notifications 
to the enabled channels. It is also possible to 
[configure](./notifications.html#configuring-notification-levels) the level of notifications to be sent.

See how to configure notifiers [here](./notifications.html#id1).
