## Reports

### Overview

Use Aim reports to organize runs, embed visualizations, describe your findings, and share updates with collaborators. 

The following image shows an example of a report created from metrics that were logged to aim over the course of a training. 
<img alt="View Mode" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/view-mode.png">


### The report page
In single report page you can find 2 modes: `view` and `edit`. 


Create the report in `edit` mode and view the final result in the `view` mode. The example above is on the `view` mode.
You can use 
**```aim** sections to retrieve data from Aim storage and visualize them. The example shown below is an overview of the `edit` mode.

<img alt="Edit Mode" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/edit-mode.png">


The details on objects and methods for data fetching and visualization are in the next sections.

### Data fetching methods

To retrieve data from Aim storage the following methods of `repo` object.

__*Note:*__ the `repo` object is by default available in the report context.


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

````python
```aim
metrics = repo.fetch_metrics('metric.name == "loss"')
linechart = LineChart(metrics)
```
````


### Visualization objects and methods

The following classes and methods are used to visualize all the data types fetched from Aim storage. 
There are small examples provided with each one showing a basic usage.



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
````python
```aim
metrics = repo.fetch_metrics()
linechart = LineChart(metrics, x='timestamps')
```
````

- `ImagesList`

Signature:
`ImagesList(data)`

<img alt="Images List" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/images-list.png">

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required| the data to be plotted |

Example:

````python
```aim
images = repo.fetch_images()
ImagesList(images)
```
````

- `AudiosList`

Signature:
`AudiosList(data)`

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required | the data to be plotted |

Example:
````python
```aim
audios = repo.fetch_audios()
AudiosList(audios)
```
````

- `FiguresList`

Signature:
`FiguresList(data)`

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required| the data to be plotted |

Example:
````python
```aim
figures = repo.fetch_figures()
FiguresList(figures)
```
````

- `TextsList`

Signature:
`TextsList(data)`

Parameters:

| name | type | default | default | 
|-----|------------|---------|-------|
| `data` | `List[dict]` | required| the data to be plotted |


 Example:
````python
```aim
texts = repo.fetch_texts()
TextsList(texts)
```
````


All the aforementioned objects have `group` method available to them:

```python
def group(prop: str, value: Union[str, list]):
    ...
```
`prop`- name of the property to be grouped by. Available options are: `color`, `stroke_style`, `row`, `column` (the first 2 are available for `LineChart `only)

`value`- single or multiple values of sequence fields to be grouped by. Available fields are all those fields that are also available in grouping options of the explorer pages.

The `group` method can be applied multiple times sequentially.

Example:
````python
```aim
metrics = repo.fetch_metrics()
linechart = LineChart(metrics)
linechart.group('color', 'run.hash')
linechart.group('row', ['metric.name', 'metric.context.subset'])
```
````

<img alt="Grouping Example" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/grouping-example.png">

### Search Report 
The search bar is available so you can easily find the report you are looking for.
 
<img alt="Search Report" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/search-report.png">

### Delete Report
    
The Delete button is available with the options button in the upper right corner of the report card. 
It will open a modal, where you can confirm or cancel the deletion.

<img alt="Delete Report" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/reports/delete-report.png">
