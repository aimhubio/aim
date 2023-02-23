## Anonymized Telemetry
We constantly seek to improve Aim for the community. 
Telemetry data helps us immensely by capturing anonymous usage analytics and statistics. 
The "anonymous usage" means that no user-specific data is tracked. Aim will generate a unique
random ID, which is not tied to any user data (such as e-mail, UNIX username, etc.).
You will be notified when you run `aim up`, `aim server` commands,
as well as when running any SDK method which is tracked by Aim.
User-defined data is **NOT** tracked. Only the fact of certain event has happened is tracked. Here is the complete list of events tracked by Aim SDK:
 
- Aim UI start (`aim up`)
- Aim Remote Tracking server start (`aim server`)
- Aim Watcher service start (`aim-watcher start`)
- New Repo initialization/re-initialization of existing Repo (`aim init`)
- New Run created
- Run resumed

### Motivation
Aim uses segment's analytics toolkit to collect basic info about the usage:
- Anonymized stripped-down basic usage analytics;
- Anonymized number of experiments and run. We constantly improve the storage and UI for performance in case of many experiments. This type of usage analytics helps us to stay on top of the performance problem. 

### How to opt out
You can turn telemetry off by running the following CLI command:

```shell
aim telemetry off
```

In order to turn telemetry back on, run

```shell
aim telemetry on
```

> Note: Setting `AIM_UI_TELEMETRY_ENABLED` environment variable to `0` is obsolete.
You'll get a warning message if the variable is set, while telemetry is turned on.