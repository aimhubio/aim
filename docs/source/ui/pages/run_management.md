# Runs Management

## Runs Explorer

### Overview

To navigate into Runs Explorer, click on the `Runs` navigation item from the left sidebar.

Runs explorer helps you to

- [Search runs with pythonic query](#search-runs)
- [Observe runs in real time](#id1)
- [Delete or archive runs](#id2)
- [Export Runs report](#id3)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/runs.png">

#### Search Runs

Use Search bar to query runs with [Aim QL](../../using/search.html).

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Search Bar" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/search_runs.png">

#### Observe runs in real time

Switch `Live Update` to turn on the real time mode.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Live Update" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/live_update.gif">

#### Delete or archive runs

Step 1: Select runs on the runs table:

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch archive" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/select_runs.png">

Click on the `Archive` button. Confirmation popup appears. Click `Archive` again and the runs are archived!

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch archive" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/archive_runs_model.png">

In order to batch delete the selected runs, just use the `Delete` button.
In this case ase well, press `Delete` again on the confirmation popup, and the runs will be hard deleted.
_**Warning:**_ this operation is irreversible, and the runs are deleted from the disk.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch delete" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/delete_runs_model.png">

#### Export Runs report

Generate Runs CSV report by clicking on the `Export` button on the Runs table.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer export runs" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/export_runs.png">

## Single run page

Each training run has a dedicated page on Aim. Use the single run page to observe all the tracked metadata associated with that run.

Here are the tabs available on the single run page.
Each tab visualizes respective tracked metadata or empty if not tracked.

- [Overview](#id5)
- [Params](#id6)
- [Metrics](#id7)
- [System](#id8)
- [Distributions](#id9)
- [Images](#id10)
- [Audios](#id11)
- [Texts](#id12)
- [Figures](#id13)
- [Terminal Logs](#id14)
- [Settings](#id15)

### Overview

Overview tab shows overall info about the run.

- These cards can contain information about `Parameters`, `Metrics`, `System Metrics`, `CLI Arguments`, `Environment Variables`, `Packages` and `Git information`. With this data, you can easily reproduce your run.

- Sidebar contains information about `Run Date`, `Run Duration`, `Run Hash`, attached `Tags` and gives the ability to navigate through tabs.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page overview tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/overview_tab.png">

Also, you can apply advanced `searching/filtering` to those card tables.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page overview tab table" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/overview_tab_table.png">

### Params

Params tab contains a JSON-like visualization of all the tracked params data related to a single run of interest.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page params tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/params_tab.png">

### Metrics

Metrics tab contains the visualizations of all the metrics tracked for the given run.

When exploring run results, some metrics are looked at more often. Pin those metrics to the top of the page to find them easier and faster. Undo pinning by clicking on "unpin" button.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page metrics tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/metrics_tab_pin.png">

**Note:** you can track arbitrary number of runs with lots of steps with Aim!

### System

Aim automatically tracks system metrics, so you can use them in order to detect potential resource mismanagements or anomalies.

System tab contains all the tracked system metrics for a single run.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page system tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/system_tab.png">

### Distributions

You can track the gradient, the weights and the biases distributions of all the layers for lots of steps with Aim.

The Distributions tab will allow you to observe them for a single run. You can also

- navigate between the layers
- search for distribution on specific steps

The single run distributions tab is quite powerful!

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page distributions tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/distributions_tab.png">

### Images

The Images tab contains all the tracked images of a single run.
You can track runs with different contexts and at different steps of training.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page images tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/images_tab.png">

On the left-hand side are the names of different image-sets you have tracked along with their [context](../../understanding/concepts.html#sequence-context) unpacked.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select Context" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/select_context.png">

Usually the images are tracked at diff steps and with batches. This control will allow you to quickly slice and dice the specific subset of images to view.
Use these sliders to search

- which subset of steps you'd like to see (on the left-hand side)
- which indices you'd like to see (on the right-hand side)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Slider" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-range-panel.png">

If there is only 1 step or only 1 index, you will see the info message instead of the control

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Slider" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/range_panel_with_info_massages.png">

### Audios

You can track audios with Aim. Use the Audios tab to view and play the tracked audios of a single run.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run audios params tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/audios_tab.png">

### Texts

Use the `Texts` tab to view and search all the texts tracked for a single run.

On the left-hand side you will see the name and context of the tracked texts.
You can use the search-bar on top to search the text with regexp or just match word or case.

Use the bottom controllers to control the steps and the indices of the tracked texts too.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page texts tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/texts_tab.png">

### Figures

Aim allows tracking Plotly and matplotlib figures.
On the `Figures` tab you can view all the track figures over different contexts and steps.

**Note:** Aim will render figures with passed or default dimensions. There will be scrolls if the size exceeds the plotly container space of the Figures tab.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page figures tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/figures_tab.png">

### Terminal Logs

Aim streams the process output logs (terminal logs) to the Aim UI automatically near-real-time. The terminal logs are displayed under `Logs` tab on the single run page.The terminal logs can be disabled programmatically if needed. [More on terminal logs here](../../using/configure_runs.html#capturing-terminal-logs).

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page logs tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/logs_tab.png">

### Settings

Use the `Settings` tab to delete or archive the single run

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page settings tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/settings_tab.png">

#### Delete Run

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Delete Run card" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/delete_card.png">
<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Delete confirm" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/delete_modal.png">

#### Archive Run

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Archive card" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/archive_card.png">
<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Unarchive card" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/unarchive_card.png">

## Experiment page

The experiment page provides overall information about the single experiment, and it helps you to group related runs and explore them.

Here are the tabs available on the experiment page.

- [Overview](#id18)
- [Runs](#id21)
- [Notes](#id22)
- [Settings](#id23)

### Overview

The Overview tab provides an overview of the runs that are attached with the experiment.
It displays general information about these runs, such as their status, progress, and other relevant metadata.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page overview tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-overview-tab.png">

#### Statistics

On this page, you can view the total number of runs, as well as the number of runs that are `archived`, `active`, and `finished`.
You can click on the corresponding cards to view more information about these runs, and you can also use these cards to navigate to the [Runs explorer](../pages/run_management.html#runs-explorer) page with a specific query.
The statistics bar, below the `status` cards, displays the distribution of runs by status.

#### Contributions heatmap

The heatmap shows the intensity of the runs (attached to the experiment), you have made for the day. More about Contributions heatmap you can read [here](../pages/home_page.html#id8).

#### Activity feed

This section represents the activity feed of your contributions related to the experiment. More about Activity feed you can read [here](../pages/home_page.html#id9).

### Runs

The Runs tab is for showing the list of runs attached to the experiment, it also gives ability to compare them by available explorers.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page runs tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-runs-tab.png"> 

### Notes

The Notes tab is for attaching simple text or rich Markdown as note to the experiment.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page notes tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-notes-tab.png">

### Settings

The Settings tab is for editing experiment name and description.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page settings tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-settings-tab.png">

## Tags page

### Overview
Tags functionality intended to mark a runs. A tag can be attached to the runs to distribute by segments and then find it quickly.

### Create tag
How to create tag?
There are two options for creating a tag.
##### First option
- Go to the tags page by clicking on the Tags from the left sidebar.

- Click on the create tag button to open the create tag form modal. In this modal there is the form that has two input fields first one for tag name the second one for tag comment and also there are exist color pallets for selecting tag color.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Create tag" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/1.png">

- Type name for a tag. Name filed is mandatory and can't be empty for tag creation form and has maximum 50 symbol limit validation.
- Type comment for a tag. Comment field is optional for tag creation form and has max 200 symbol limit validation.
- Select color for a tag from the color pallet.
- Click to the create button for saving a the tag then. After successful saving should appear toaster approving the create on the right top corner of the window. Optional there are default selected colors for tag.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Create tag modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/2.png">

##### Second option
- Go to any explorer page (metrics, params, images, scatters).
- Click to one of the sequence unit to open popover where is exist tag section with attach button.
- Click on attach button to open the select tag popover where you will see all your previously created tags.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/3.png">

- Click create tag button and you will be redirected to the tags page than the actual first option.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/4.png">

### Attach tag
#### How to attach tag to the run?
- Go to any explorer page (metrics, params, images, scatters).
- Click to one of the sequence unit to open popover where is exist tag section with attach button.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/5.png">

- Click on attach button to open the select tag popover where will be visible all tags.
- Select a tag you want to attach to the sequence unit. You can select more then on tag for each point.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/6.png">

### Update attached tags
How to update attached tags?
- Go to any explorer page (metrics, params, images, scatters).
- Select point which you want to attach tag and click on it to open popover where is the exist tag section. In tags section will be visible already attached tags.
- Click on attach button for adding new tag to open the select tag popover where will be visible all existing tags.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/7.png">

- Click on x icon in the right end of the each tag for removing the tag from the point.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/8.png">

### Edit tag
#### How to edit tag?
- Go to the tags page
- Click to edit icon in the right side in the tag row

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags table" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/9.png">

- Then should appear the edit modal. In the edit modal there is the form that has two input fields first one for tag name the second one for tag comment and also there are exist color pallets for selecting tag color. In this modal is possible to make changes for tag.
- Make changes you need.
- Then you have three possible actions close modal, save changes and reset changes. After closing the modal you will lose all changes, after clicking the reset button modal form fields will be reset to initial values and by clicking the save button you will save all changes for the tag. After successful saving should appear toaster approving the update on the right top corner of the window.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags edit modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/10.png">

### Delete tag
#### How to delete tag?
- Go to the tags page.
- Click on the trash icon in the right side in the tag row to open the delete modal.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/11.png">

- In the delete modal there is a tag name input field and a tag name label at the top of the tag name input. You need to type the tag name for approving you are want to delete that tag.
- Then you have two possible actions delete the tag or close the modal by canceling the delete operation. If you want to delete a tag please double-check the tag name and click to delete button. After tag deletion, there are no possibilities to recover it. Also if you are deleting the tag it will be removed from all relations too.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/12.png">

### Used in overlay
In the tags page you can select tag by clicking on circle icon then will opened overlay in the right side of window. Here is visible that runs which are use the tag. By clicking a run hash you will be redirected to single run page.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags delete modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/13.png">