# Runs Management

## Runs Explorer

### Overview

To navigate into Runs Explorer, click on the `Runs` navigation item from the left sidebar.

Runs explorer helps you to

- [Search runs with pythonic query](#search-runs)
- [Observe runs in real time](#follow-runs-in-a-real-time)
- [Delete or archive runs](#delete-and-archive-runs-by-batch)
- [Export Runs report](#export-runs-report)

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/runs.png">

#### Search Runs

Use Search bar to query runs with [Aim QL](../../using/search.html).

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Search Bar" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/search_runs.png">

#### Follow runs in real time

Switch `Live Update` to turn on the real time mode.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Live Update" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/live_update.gif">

#### Delete or archive runs

Step 1: Select runs on the runs table:

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch archive" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/select_runs.png">

Click on the `Archive` button. Fonfirmation popup appears. Click `Archive` again and the runs are archived!

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch archive" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/archive_runs_model.png">

In order to batch delete the selected runs, just use the `Delete` button.
In this case ase well, press `Delete` again on the confirmation popup and the runs will be hard deleted.
_**Warning:**_ this operation is irreversible and the runs are deleted from the disk.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer Batch delete" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/delete_runs_model.png">

#### Export Runs report

Generate Runs CSV report by clicking on the `Export` button on the Runs table.

<img style="border-radius: 8px; border: 1px solid #E8F1FC" alt="Runs Explorer export runs" src="https://docs-blobs.s3.us-east-2.amazonaws.com/images/ui/pages/runs-explorer/export_runs.png">

## Single run page

Each training run has a dedicated page on Aim. Use the single run page to observe all the tracked metadata associated with that run.

Here are the tabs available on the single run page.
Each tab visualizes respective tracked metadata or empty if not tracked.

- [Overview](#id4)
- [Params](#id5)
- [Metrics](#id6)
- [System](#id7)
- [Distributions](#id8)
- [Images](#id9)
- [Audios](#id10)
- [Texts](#id11)
- [Figures](#id12)
- [Terminal Logs](#id13)
- [Settings](#id14)

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
