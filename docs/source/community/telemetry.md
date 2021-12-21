## Anonymized Telemetry
We constantly seek to improve Aim for the community. 
Telemetry data helps us immensely by capturing anonymous usage analytics and statistics. 
You will be notified when you run `aim up`.
The telemetry is collected only on the UI. 
The python package **does not** have any telemetry associated with it.

### Motivation
Aim UI uses segment's analytics toolkit to collect basic info about the usage:
- Anonymized stripped-down basic usage analytics;
- Anonymized number of experiments and run. We constantly improve the storage and UI for performance in case of many experiments. This type of usage analytics helps us to stay on top of the performance problem. 

.. note::
   No analytics is installed on the Aim Python package.

### How to opt out
You can turn telemetry off by setting the `AIM_UI_TELEMETRY_ENABLED` environment variable to `0`.
