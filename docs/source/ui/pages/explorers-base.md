### Explorers

Multidimensional data comparison allows to explore the data and identify patterns, trends, outliers, and anomalies.
Explorers are powerful tools to search, query and visually compare 1000s of AI experiments with a few clicks. They are main tools that Aim is built around.
Started from V(x) introduced new approach of processing and visualizing AI experiments.

#### Built-in explorers over new base

- **Figures Explorer**
- **Audio Explorer**

#### Sections

The explorer consists of 3 general sections.

- [Searching and Querying](#searching-and-querying)
- Processing (Grouping, Ordering)
- Visualizing

#### Searching and Querying

The searching and querying section provides a user-friendly interface to query [Objects](link to term) by doing simple selections of [Contexts](link to term) or using reach Autocomplete input of pythonic [Aim QL](../../using/search.html).

<img alt="Figures explore search" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/figures-explorer/figures-search-bar.png">

##### Using simple selections

The `+` button located at the left-top corner of this section is used to select preferred values of [Contexts](link to term) which is going to be queried after clicking on the `Search` button.
The text `+ Figures` indicates the sequence name, whose explorer is opened up, i.g. if searching on `Audio Explorer` shows `+ Audios`, [etc](link to sequences).

<img alt="Figures explore select form" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/figures-explorer/figures-select.png">

##### Using pythonic query

The search bar is located below the `+ Figures` button. It allows to do a pythonic query (that is eval-ed as python statement) over every param you have tracked.

The query follows to the [Aim QL](../../using/search.html) laws, i.e. if it needs to get only objects for the specific [Run](link to term), simply type `run.hash == "hash_1"` inside input. After clicking on the `Search` button, it will get only objects of the `hash_1` [Run](link to term).

To use advanced query mode

- Click on pencil icon in right side of select form to show input
- Type advance [Aim QL](../../using/search.html) query
- Click on the Search button

<img alt="Figures explore advanced search" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/figures-explorer/figures-advanced-search.png">

#### Resetting query and selections

It's possible to reset the query and selections by clicking on the reset icon button.

<img alt="Figures explore reset select form" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/figures-explorer/figures-reset.png">

#### Querying with training steps range and density

At the bottom of explorer located a range panel which allows to easily query tracked objects with step, index ranges and density.

- Select preferred step ranges and density
- Click on the apply button

<img alt="Figures explore range slider" style="border-radius: 8px; border: 1px solid #E8F1FC" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/figures-explorer/figures-range-selector.png">

[Object depths]
