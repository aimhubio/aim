## Reports

### Overview

Use Aim reports to organize runs, embed visualizations, describe your findings, and share updates with collaborators. 

The following image shows an example of a report created from metrics that were logged to aim over the course of a training. 
<img alt="View Mode" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/view-mode.png">


### Single report page
In single report page you can find 2 modes: `view` and `edit`. 


In `edit` mode you can create the report that you wish for and in view mode see the final result of it, the example shared above is of the `view` mode.

You can use 
**```aim** sections to retrieve data from BE and visualize them. The example shown below is an overview of the `edit` mode.

<img alt="Edit Mode" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/edit-mode.png">


To get acquainted with objects and methods to fetch and visualize data check out the sections below:

### Data fetching methods

To retrieve data from BE the following methods of `repo` object

| Method | Description |
| -------- | ----------- |
| `fetch_metrics` | Repo metrics |
| `fetch_images` | Repo images |
| `fetch_audios` | Repo audios |
| `fetch_figures` | Repo figures |
| `fetch_texts` | Repo texts |

All the methods accept a query parameter which defaults to `True` (fetches all the available sequences).

The results of this 
Example:

```python
```aim
metrics = repo.fetch_metrics('metric.name == "loss"')
linechart = LineChart(metrics)
```\
```


### Visualization objects and methods

- `LineChart`

Signature:
`LineChart(data, x, y)`

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required| the data to be plotted |
| `x`| `str` | `steps` |  the path to the property for the x-axis value (for fetched metrics available options are `epochs`, `timestamps`)|
| `y`| `str` | `values`| the path to the property for the y-axis value |

Example:

```aim
metrics = repo.fetch_metrics()
linechart = LineChart(metrics, x='timestamps')
```

- `ImagesList`

Signature:
`ImagesList(data)`

<img alt="Images List" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/images-list.png">

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required| the data to be plotted |

Example:

```
images = repo.fetch_images()
ImagesList(images)
```


- `AudiosList`

Signature:
`AudiosList(data)`

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required | the data to be plotted |

Example:
```
audios = repo.fetch_audios()
AudiosList(audios)
```
- `FiguresList`

Signature:
`FiguresList(data)`

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required| the data to be plotted |

Example:
```
figures = repo.fetch_figures()
FiguresList(figures)
```
- `TextsList`

Signature:
`TextsList(data)`

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required| the data to be plotted |


 Example:
```
texts = repo.fetch_texts()
TextsList(texts)
```


All the aforementioned objects have `group` method available to them:

```python
def group(prop, values=[]):
    ...
```
`prop`- name of the property to be grouped by. Available options are: `color`, `stroke_style`, `row`, `column`

`value`- list of values of sequence fields to be grouped by. Available fields are all those fields that are also available in grouping options of the explorer pages.

The `group` method can be applied multiple times sequentially.

Example:
```
metrics = repo.fetch_metrics()
linechart = LineChart(metrics)
linechart.group('color', ['run.hash'])
linechart.group('row', ['metric_name'])
```

<img alt="Grouping Example" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/grouping-example.png">

### Search Report 
You can easily find the report in a big pile with the search ba.
<img alt="Search Report" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/search-report.png">

### Delete Report
    
You can find the `Delete` button under the options button in the upper right corner of the report card. 
It will open a modal, where you can confirm or cancel the deletion.

<img alt="Delete Report" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/delete-report.png">
