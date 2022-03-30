## Running Aim with profiling

Aim comes with profiling feature which is logging all api requests to the backend into a directory inside your
repository. We use [pyinstrument](https://pyinstrument.readthedocs.io/en/latest/) as underlying profiler. To toggle
profiling, run `aim up` with `--profiler` flag.

`$ aim up --profiler`

This will instruct backend to create a new directory inside your repository (`.aim/profler`). On every api call,
profiler will create an `.html` file containing whole run trace of that api. Basically you can navigate into that
directory and open the file in your browser to see where's the performance bottleneck.

### Why would you need to enable the profiling.

Well you don't, unless we explicitly ask you to in case you have any performance issues while using Aim.

Please note that no data is sent to us when profiling is toggled. Everything is stored locally and managed by the end
user.
