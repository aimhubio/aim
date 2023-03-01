# Runs Management

The page provides a comprehensive overview of runs. The primary sections of the page include:

- [Runs explorer](#id1)
- [Single run page](#id5)
- [Experiment page](#id18)
- [Tags page](#id27)

## Runs Explorer

### Overview

To navigate to the Runs Explorer, click on the `Runs` navigation item in the left sidebar.

Runs explorer helps you to

- [Search runs with pythonic query](#search-runs)
- [Observe runs in real time](#id2)
- [Delete or archive runs](#id3)
- [Export Runs report](#id4)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/runs.png">

#### Search Runs

Use Search bar to query runs with [Aim QL](../../using/search.html).

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Search Bar" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/search_runs.png">

#### Observe runs in real time

Switch `Live Update` to turn on the real-time mode.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Live Update" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/live_update.gif">

#### Delete or archive runs

Step 1: Select runs on the runs table:

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch archive" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/select_runs.png">

Click on the `Archive` button. A confirmation pop-up appears. Click `Archive` again and the runs are archived!

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch archive" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/archive_runs_model.png">

To batch delete the selected runs, use the `Delete` button. 
As before, press `Delete` again on the confirmation pop-up, and the runs will be permanently deleted.
_**Warning:**_ This operation is irreversible, and the runs will be deleted from the disk.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch delete" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/delete_runs_model.png">

#### Export Runs report

Generate a Runs CSV report by clicking on the `Export` button on the Runs table.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer export runs" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/export_runs.png">

## Single run page

Each training run has its dedicated page on Aim. The single-run page allows you to view all the tracked metadata associated with that run.

The single-run page includes the following tabs, each of which visualizes the respective tracked metadata or is empty if not tracked.

- [Overview](#id7)
- [Params](#id8)
- [Metrics](#id9)
- [System](#id10)
- [Distributions](#id11)
- [Images](#id12)
- [Audios](#id13)
- [Texts](#id14)
- [Figures](#id15)
- [Terminal Logs](#id16)
- [Settings](#id17)

### Overview

The Overview tab provides overall information about the run. 

- It includes cards with information about the `Parameters`, `Metrics`, `System Metrics`, `CLI Arguments`, `Environment Variables`, `Packages` and `Git information`. 
  This data makes it easy to reproduce the run. 
- The sidebar displays information about the `Run Date`, `Run Duration`, `Run Hash`, attached `Tags` and provides the ability to navigate through tabs.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page overview tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/overview_tab.png">

You can also apply advanced `searching` and `filtering` to the card tables.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page overview tab table" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/overview_tab_table.png">

### Params

The Params tab contains a JSON-like visualization of all the tracked parameters data related to a single run of interest.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page params tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/params_tab.png">

### Metrics

The Metrics tab contains visualizations of all the metrics tracked for a given run. 
When exploring run results, some metrics are looked at more frequently. 
To make them easier and faster to find, you can pin them to the top of the page. 
To undo pinning, click on the `Unpin` button.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page metrics tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/metrics_tab_pin.png">

**Note:** Aim allows you to track an arbitrary number of runs with lots of steps!

### System

Aim automatically tracks system metrics, allowing you to detect potential resource mismanagement or anomalies.

The System tab contains all the tracked system metrics for a single run.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page system tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/system_tab.png">

### Distributions

You can track the gradients, weights, and biases distributions of all layers for multiple steps using Aim.

The Distributions tab allows you to observe them for a single run and also:
- navigate between layers 
- search for distributions on specific steps.

The single run Distributions tab is quite powerful!

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page distributions tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/distributions_tab.png">

### Images

The Images tab contains all the tracked images of a single run. 
You can track runs with different contexts and at different steps of training.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page images tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/images_tab.png">

On the left-hand side, you will see the names of the different image sets you have tracked along with their [context](../../understanding/concepts.html#sequence-context) unpacked.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select Context" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/select_context.png">

Usually, images are tracked at different steps and with batches. 
The provided controls will allow you to quickly slice and view a specific subset of images.

Use these sliders to search:

- which subset of steps you'd like to see (on the left-hand side)
- which indices you'd like to see (on the right-hand side)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Slider" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/images-explore/images-explore-range-panel.png">

If there is only one step or only one index, you will see an informational message instead of the control.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Slider" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/range_panel_with_info_massages.png">

### Audios

Aim allows you to track audios. Use the Audios tab to view and play the tracked audios of a single run.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run audios params tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/audios_tab.png">

### Texts

Use the Texts tab to view and search for all the texts tracked for a single run.

On the left-hand side, you will see the name and context of the tracked texts. 
You can use the search bar at the top to search for the text using regex or just match words or cases.

Use the bottom controllers to control the steps and indices of the tracked texts as well.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page texts tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/texts_tab.png">

### Figures

Aim allows tracking of Plotly and matplotlib figures. 
On the Figures tab, you can view all the tracked figures across different contexts and steps.

**Note:** Aim will render figures with passed or default dimensions. If the size exceeds the Plotly container space of the Figures tab, scrollbars will be provided.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page figures tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/figures_tab.png">

### Terminal Logs

Aim automatically streams process output logs (terminal logs) to the Aim UI in near-real-time. 
The terminal logs are displayed under the Logs tab on the single run page. 
The terminal logs can be programmatically disabled if needed. [More on terminal logs here](../../using/configure_runs.html#capturing-terminal-logs).

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page logs tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/logs_tab.png">

### Settings

Use the Settings tab to delete or archive the run.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Single Run page settings tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/settings_tab.png">

#### Delete Run

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Delete Run card" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/delete_card.png">
<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Delete confirm" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/delete_modal.png">

#### Archive Run

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Archive card" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/archive_card.png">
<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Unarchive card" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/run-single-page/unarchive_card.png">

## Experiment page

The experiment page provides overall information about a single experiment and helps to explore the runs associated with the experiment. 
Here are the tabs available on the experiment page:

- [Overview](#id21)
- [Runs](#id24)
- [Notes](#id25)
- [Settings](#id26)

### Overview

The Overview tab provides an overview of the runs associated with the experiment. 
It displays general information such as their status, progress, and other relevant metadata.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page overview tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-overview-tab.png">

#### Statistics

On this page, you can view the total number of runs, as well as the number of runs that are `archived`, `active`, and `finished`.
You can click on the corresponding cards to view more information about these runs, and you can also use these cards to navigate to the [Runs explorer](../pages/run_management.html#runs-explorer) page with a specific query.
The statistics bar, below the `status` cards, displays the distribution of runs by status.

#### Contributions calendar

The contributions calendar represents the intensity of executed runs, associated with the experiment, during the previous year. 
Each cell represents the set of training runs for that day. More on this read [here](../pages/home_page.html#id8).

#### Activity feed

This section represents the activity feed of your contributions associated with the experiment.
It shows the `starting date`, `progress` and `name` of the runs, as a link to the corresponding run page.

### Runs

The Runs tab shows the list of runs associated with the experiment, and it also gives the ability to compare them using the available explorers.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page runs tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-runs-tab.png"> 

### Notes

The Notes tab is for attaching simple text or rich Markdown as a note to the experiment.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page notes tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-notes-tab.png">

### Settings

The Settings tab is for editing the experiment's name and description.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Experiment page settings tab" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/experiment-page/experiment-page-settings-tab.png">

## Tags page

### Overview

The Tags functionality is intended to mark runs. A tag can be attached to runs to segment them to be able to quickly find them.

### Create tag

There are two options for creating a tag:

##### Option 1: From Tags page

- Go to the tags page by clicking on the `Tags` button from the left sidebar.

- Click on the `Create tag` button to open the create tag form modal.
  In this modal, there is a form that has two input fields: the first one for the tag name, and the second one for the tag comment. 
  There are also color palettes available for selecting the tag color.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Create tag" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/1.png">

- Type the name for the tag. The name field is mandatory and cannot be empty for the tag creation form, and has a maximum 50 symbol limit validation.
- Type a comment for the tag. The comment field is optional for the tag creation form and has a maximum 200 symbol limit validation.
- Select a color for the tag from the color palette.
- Click on the `Create` button to save the tag. After successful saving, a toast notification should appear in the top-right corner of the window to confirm the creation. 
  There are also default selected colors for the tag available.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Create tag modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/2.png">

##### Option 2: From Explorers page

- Go to any explorer page (such as metrics, params, images, or scatters).
- Click on one of the sequence units to open the popover where the tag section with an `Attach` button exists.
- Click on the `Attach` button to open the `Select tag` popover where you will see all of your previously created tags.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/3.png">

- Click on the `Create tag` button, and you will be redirected to the tags page than the actual first option.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/4.png">

### Attach tag

- Go to any explorer page (such as metrics, params, images, or scatters).
- Click on one of the sequence units to open a popover that contains a tag section with an `Attach` button.
  
<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Attach tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/5.png">

- Click on the `Attach` button to open the `Select tag` popover where all tags will be visible. 
- Select the tag(s) you want to attach to the sequence unit. You can select more than one tag for each point.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/6.png">

### Update attached tags

- Go to any explorer page (such as metrics, params, images, or scatters).
- Select the point to which you want to attach a tag and click on it to open a popover. 
  In the tags section, you will see any already attached tags.
- Click on the `Attach` button to add a new tag and open the `Select tag` popover, where all existing tags will be visible.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/7.png">

- Click on the `X` icon at the right end of each tag to remove the tag from the point.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/8.png">

### Edit tag

- Go to the tags page. 
- Click on the edit icon on the right side of the tag row.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags table" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/9.png">

- An edit modal will appear. In the edit modal, there is a form that has two input fields: the first one is for the tag name, the second one is for the tag comment.
  Use the color palette to pick your preferred color for the tag.
- Make any necessary changes. Then, you have three possible actions: close the modal, save changes, and reset changes. 
  If you close the modal, you will lose all changes. If you click the reset button, the modal form fields will be reset to their initial values. 
  If you click the save button, all changes for the tag will be saved. 
  After successful saving, a toaster notification will appear in the top right corner of the window, approving the update.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags edit modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/10.png">

### Delete tag

- Go to the tags page.
- Click on the trash icon on the right side of the tag row to open the delete modal.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/11.png">

- In the delete modal, there is a tag name input field, and a tag name label at the top of the input field. 
  You need to type the tag name to confirm that you want to delete that tag.
- Then you have two possible actions: delete the tag or close the modal by canceling the delete operation. 
  If you want to delete a tag, please double-check the tag name and click the delete button. Once a tag is deleted, it cannot be recovered. 
  Also, if you delete a tag, it will be removed from all related items as well.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Select tag popover" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/12.png">

### Used in overlay

On the tags page, you can select a tag by clicking on the circle icon. 
This will open an overlay on the right side of the window. In this overlay, you can see the runs that use the selected tag. 
By clicking on a run hash, you will be redirected to the single run page.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Tags delete modal" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/tags/13.png">