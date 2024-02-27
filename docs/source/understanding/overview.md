## Overview

Aim is built around several concepts allowing to make sure that it meets the following criteria:
- **Run data isolation**. Each training run process isolated in terms of data and do not require additional services to run.
- **Scalability**. Aim web app is able to handle 1000s of training runs. Starting from v3.4.0 Aim provides a
[Remote Tracking server](./remote_tracking_basics.html) allowing to run multiple parallel experiments in a distributed multi-host environment.
- **Flexibility**. Aim UI and query language allow users to select, group and filter the tracked data any way they want.

### Aim Components
In order to understand how Aim works, lets take a quick look on a different components it has.
- **Aim Storage**. At its core Aim uses a custom-built storage, based on [rocksdb](http://rocksdb.org/docs/getting-started.html). More details in 'Where is data collected?'. Data tracked by
different training runs collected and indexed in an aim repository (`.aim`). The storage itself is generic; it
allows accessing the data as collection of dictionaries and arrays.
- **Aim SDK**. On top of the storage Aim SDK provides functionality to track/select/query data. Additionally, SDK is a layer used by Web APIs
and CLI.
- **Aim UI**. Web app allowing to browse run metadata, metrics, images and other tracked data.
- **Aim CLI**. A collection of command line utilities for running Aim web server, managing aim repositories, runs, etc.
- **Remote Tracking server**. A fastapi/uvicorn based service accepting incoming traffic and storing data on a centralized server.


The next sections will describe various concepts Aim introduces and provide more detailed look on
individual components introduced above.


