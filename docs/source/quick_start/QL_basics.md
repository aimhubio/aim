## Search Basics

### Introduction

Aim enables a powerful query language(AimQL) to filter through all the stored metadata. 

AimQL filters the tracked metadata using **python expression**.
Think of it as a python if statement over everything you have tracked.
Hence, nearly any python compatible expression is available with [security restrictions](#security-restrictions) in place.

The data is saved as diff types of entities (e.g. `run`, `metric`). The search queries are written against these entities.
When iterating over entities the python expression is evaluated in a Boolean context. When the value is _"truthy"_, then the current entity is yielded. Otherwise the entity is skipped over.

.. note::
   Currently, AimQL is only used for filtering data, and has no role in sorting or aggregating the data.

### Searching runs

Let's track several [Runs](./SDK_basics.html#create-a-run) via [Aim SDK](./SDK_basics.html):

```python
# Initialize run_1
# Define its params and track loss metric within test and train contexts
run_1 = Run()
run_1['learning_rate'] = 0.001
run_1['batch_size'] = 32
for i in range(10):
    run_1.track(i, name='loss', context={ 'subset':'train' })
    run_1.track(i, name='loss', context={ 'subset':'test' })

# Initialize run_2
run_2 = Run()
run_2['learning_rate'] = 0.0007
run_2['batch_size'] = 64
for i in range(10):
   run_2.track(i, name='loss', context={ 'subset':'train' })
   run_2.track(i, name='loss', context={ 'subset':'test' })

# Initialize run_3
run_3 = Run()
run_3['learning_rate'] = 0.005
run_3['batch_size'] = 16
for i in range(10):
   run_2.track(i, name='loss', context={ 'subset':'train' })
   run_2.track(i, name='loss', context={ 'subset':'test' })
```

Aim SDK will collect and store the above metadata in `.aim` repo.

| Run | Parameters | Metrics |
|-----|------------|---------|
| `run_1 <hash=a32c910>` | <table><thead> <tr> <th>learning_rate</th><th>batch_size</th> </tr> </thead>  <tbody> <tr> <th>0.001</th><th>32</th> </tr> </tbody></table> | <table><tbody> <tr> <th>loss { "subset":"train" }</th> </tr> <tr> <th>loss { "subset":"test" }</th> </tr> </tbody></table> |
| `run_2 <hash=a32c911>` | <table><thead> <tr> <th>learning_rate</th><th>batch_size</th> </tr> </thead>  <tbody> <tr> <th>0.0007</th><th>64</th> </tr> </tbody></table> | <table><tbody> <tr> <th>loss { "subset":"train" }</th> </tr> <tr> <th>loss { "subset":"test" }</th> </tr> </tbody></table> |
| `run_3 <hash=a32c912>` | <table><thead> <tr> <th>learning_rate</th><th>batch_size</th> </tr> </thead>  <tbody> <tr> <th>0.005</th><th>16</th> </tr> </tbody></table> | <table><tbody> <tr> <th>loss { "subset":"train" }</th> </tr> <tr> <th>loss { "subset":"test" }</th> </tr> </tbody></table> |

When searching runs, use the `run` keyword which represents the [Run](./SDK_basics.html#create-a-run) object. It has the following properties:

| Property | Description |
| -------- | ----------- |
| `name` | Run name |
| `hash` | Run hash |
| `experiment` | Experiment name |
| `tags` | List of run tags |
| `archived` | `True` if run is archived, otherwise `False` |
| `creation_time` | Run creation timestamp |
| `end_time` | Run end timestamp |

Run [parameters](./SDK_basics.html#track-params-and-metrics-with-run) could be accessed both via chained properties and attributes.

.. note::

   The two following examples are equal:
    - run.hparams.learning_rate == 32
    - run["hparams", "learning_rate"] == 32

.. warning::
   AimQL has been designed to be highly performant.
   Only the params that are used in the query will be loaded into memory.

   If you use the **['hparams']['learning_rate']** syntax Aim will load the whole dictionary into memory. The search performance will be impacted.

   We recommend to use either **['hparams', 'learning_rate']** or **hparams.learning_rate** syntax which are equivalent to each other in terms of the performance.

**Query examples:**

1. Get runs where `learning_rate` is greater than `0.0001` and `batch_size` is greater than `32`.

```python
run.learning_rate > 0.0001 and run.batch_size > 32
```

*Result:*

| Run | Parameters |
|-----|------------|
| `run_2 <hash=a32c911>` | <table><thead> <tr> <th>learning_rate</th><th>batch_size</th> </tr> </thead>  <tbody> <tr> <th>0.0007</th><th>64</th> </tr> </tbody></table> |

2. Get runs where `learning_rate` is either `0.0001` or `0.005`.

```python
run.learning_rate in [0.0001, 0.005]
```

*Result:*

| Run | Parameters |
|-----|------------|
| `run_1 <hash=a32c910>` | <table><thead> <tr> <th>learning_rate</th><th>batch_size</th> </tr> </thead>  <tbody> <tr> <th>0.001</th><th>32</th> </tr> </tbody></table> |
| `run_3 <hash=a32c912>` | <table><thead> <tr> <th>learning_rate</th><th>batch_size</th> </tr> </thead>  <tbody> <tr> <th>0.005</th><th>16</th> </tr> </tbody></table> |

### Searching metrics and images

#### Searching metrics

When iterating over metrics, use the `metric` keyword which represents the tracked [metric](./SDK_basics.html#track-params-and-metrics-with-run). While searching metrics, you can also refer to the related runs via the `run` keyword.

`metric` has the following default properties.

| Property | Description |
| -------- | ----------- |
| `name` | Metric name |
| `context` | Metric context dictionary |

**Query examples**

1. Query metrics by name:

```python
metric.name == "loss"
```

*Result:*

| Metric | Related run |
|--------|-------------|
| `loss { "subset":"train" }` | `run_1 <hash=a32c910>` | 
| `loss { "subset":"test" }` | `run_1 <hash=a32c910>` | 
| `loss { "subset":"train" }` | `run_2 <hash=a32c911>` | 
| `loss { "subset":"test" }` | `run_2 <hash=a32c911>` | 
| `loss { "subset":"train" }` | `run_3 <hash=a32c912>` | 
| `loss { "subset":"test" }` | `run_3 <hash=a32c912>` |

2. Query metrics by name and context

```python
metric.name == "loss" and metric.context.subset == "train"
```

*Result:*

| Metric | Related run |
|--------|-------------|
| `loss { "subset":"train" }` | `run_1 <hash=a32c910>` |
| `loss { "subset":"train" }` | `run_2 <hash=a32c911>` |
| `loss { "subset":"train" }` | `run_3 <hash=a32c912>` |

3. Query metrics by name and run parameters

```python
metric.name == "loss" and run.learning_rate >= 0.001
```

*Result:*

| Metric | Related run |
|--------|-------------|
| `loss { "subset":"train" }` | `run_1 <hash=a32c910>` |
| `loss { "subset":"test" }` | `run_1 <hash=a32c910>` |
| `loss { "subset":"train" }` | `run_3 <hash=a32c912>` |
| `loss { "subset":"test" }` | `run_3 <hash=a32c912>` |

#### Searching images

Images search works in the same way as metrics.
When iterating over images, use the `images` keyword which represents the tracked [images sequence](./SDK_basics.html#track-images-with-run). 
While searching images, you can also refer to the related runs via the `run` keyword.

`images` keyword has the following default properties.

| Property | Description |
| -------- | ----------- |
| `name` | Image sequence name |
| `context` | Image sequence context dictionary |

*Query examples:*
- images.name == "generated" and run.learning_rate >= 0.001
- images.name == "generated" and images.context.ema == 0

### Security restrictions

AimQL expression is evaluated with [RestrictedPython](https://github.com/zopefoundation/RestrictedPython).

**RestrictedPython** is a tool that helps to define a subset of the Python language which allows to provide a program input into a trusted environment.

We have followed these [restrictions](https://github.com/aimhubio/aim/blob/e0a089516d0aaf200411358bcb43e7673e02a852/aim/storage/query.py#L150) to avoid security risks such as executing a non-safe function via AimQL.

