==============
 Notifications
==============

Set up the notification service

Being notified about key events of the training process may save hours of compute resources and researcher's time. Aim notification service sends notifications to the enabled channels (slack, workplace), when a new message is logged or a stuck run is detected.

Quick start
===========

These are the required steps in order to set up the notifications service.

1. Configure notifiers. The notifier configuration is described in detail in `Configuring Notifiers`_ section.

2. Start notifier service:

.. code-block:: shell

   aim-watcher --repo <AIM_REPO_PATH> start

Aim notifications service is comprised of the following components:

- Aim watcher service. A service responsible for sending notifications.
- Notifier configuration CLI. Command line utility for configuring where and how you want to receive notifications about training run status.

Below are the components described in more detail.

Configuring notifiers
=====================

Use ```aim-watcher`` CLI to interactively choose and setup the notifiers. Currently, following types of notifiers are supported:

- `Slack <#configuring-notifier-for-slack>`_ : to receive notifications as a message on a slack channel.
- `Workplace <#configuring-notifier-for-workplace>`_ : to receive notifications as a post in a workplace group.
- Logger: to echo notification text to watcher standard output.

The base command is:

.. code-block:: shell

   aim-watcher notifiers add

Once notifier type is selected, the watcher will ask to fill-in the required inputs for that particular notifier.

``aim-watcher`` allows configuring multiple notifiers in case you'd like to receive them in multiple channels at the same time.
Once notifier configuration added, ``aim-watcher`` should be re-run, so new configuration can take effect.

Next sections will describe the setup flow for each of them.

Configuring notifier for slack
------------------------------

*In order to execute the steps described below you must have admin permissions for Slack workspace.*

Here are the steps to configure Aim notifier for Slack.

1. Go to Slack API web `page <https://api.slack.com>`_ and push "Create an app" button.

  .. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/slack_create_app.png
    :alt: Slack create app

2. Select "From scratch" and follow the steps.
3. Make sure Incoming Webhooks are active. This is the Slack API Aim will use to send notifications.

  .. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/slack_activate_webhook.png
    :alt: Slack enable webhook

4. Create a new Webhook URL and copy to clipboard.
5. Run ``aim-watcher notifiers add slack`` and once prompted for Webhook url, paste the one copied in step 4.
6. `Optional` Change the training run failure message template.
7. Confirm setup.

Configuring notifier for workplace
----------------------------------

*In order to execute steps described below, please make sure you have access to Workplace Admin panel*

Here are the steps to configure Aim notifier for Workplace.

1. Go to "Your workplace" Admin Panel
2. Select "Integrations" tab and press "Create custom integration"

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/workplace_create_integration.png
  :alt: Workplace create integration

3. Follow the setup steps.
4. In the "Permissions" tab make sure "Manage group content" checkbox checked.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/images/using/notifiers/workplace_integration_permissions.png
  :alt: Workplace integration permissions

5. Select the group(s) where you want to receive notifications.
6. In the "Details" tab press "Create access token" and copy the generated access token.
7. Run ``aim-watcher notifiers add workplace`` and provide group ID and copied access token.
8. *Optional* Change the training run failure message template.
9. Confirm setup.

Enabling/disabling notifier configuration
=========================================

Aim watcher CLI allows to temporarily disable or completely remove notifiers. Each notifier
configuration has unique auto-generated ID which can be used to manipulate the notifier. In order to list available notifiers for the aim Repo:

.. code-block:: shell

   aim-watcher --repo . notifiers list

   > NOTIFIER ID                              TYPE       STATUS
   > 88bbacb3-159d-4ee2-8f33-180addd162f1     slack      enabled
   > 75fe529d-c060-4816-9cbb-246770cb8592     slack      disabled
   > 248821e4-2bf3-4aa9-857e-194bf3ab2f8a     logger     enabled

You can disable notifier by given ID:

.. code-block:: shell

   aim-watcher --repo . notifiers disable 88bbacb3-159d-4ee2-8f33-180addd162f1

and enable it back:

.. code-block:: shell

   aim-watcher --repo . notifiers enable 88bbacb3-159d-4ee2-8f33-180addd162f1

In order to remove notifier configuration completely:

.. code-block:: shell

   aim-watcher --repo . notifiers remove 88bbacb3-159d-4ee2-8f33-180addd162f1

Complete reference for aim-watcher CLI is available in CLI reference.

Configuring notification levels
=========================================

The notification levels to notify on logged messages can be configured. Available options are ``DEBUG``, ``INFO``, ``WARNING``, ``ERROR``.
Run ``aim-watcher notifiers set-log-level [LVL]`` command to set the level.

.. note::
   WARNING is set as a default level.
