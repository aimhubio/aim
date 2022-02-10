## Overview

Aim is built around several concepts allowing to make sure that it meets the following expectations:
- **Run data isolation**. Each training run process isolated in terms of data and do not require additional services to run.
- **Scalability**. Aim web app is able to handle 1000s of training runs. Starting from v3.4.0 Aim provides a
[Remote Tracking server]() allowing to run multiple parallel experiments in a distributed multi-host environment.
- **Flexibility**. Aim UI and query language allow users to select, group and filter tracked data any way they want.
- **Extendability**. Aim provides interface to track data beyond the primitives and objects is provides.

### Aim Components
In order to understand how Aim works, lets take a quick look on a different components it has.
- **Aim Storage**. At its core Aim uses a custom-built storage, based on rocksdb. More details in 'Where is data collected?'. Data tracked by
different training runs collected and indexed in an aim repository (`.aim`). The storage itself is generic; it
allows accessing the data as collection of dictionaries and arrays.
- **SDK**. On top of the storage Aim SDK provides functionality to track/select/query data. Additionally, SDK is a layer used by Web APIs
and CLI.
- **Web App**. Web UI allowing to browse run metadata, metrics, images and other tracked data.
- **Remote Tracking server**. A [gRPC]()-based service accepting incoming traffic and storing data on a centralized server.
- **Aim CLI**. A collection of command line utilities for running Aim web server, managing aim repositories, runs, etc.

Here is a diagram showing how data flow in Aim and how different components interact with the data

---
<div align="center">
<span style="background:lightyellow">TODO: put a flow diagram here</span>
</div>


The next sections will describe various concepts Aim introduces and provide more detailed look on
individual components introduced above.


