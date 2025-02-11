# Changelog

## Unreleased

### Fixes:
- Decrease client resources keep-alive time (mihran113)
- Fix connection of data points on epoch alignment (mihran113)

## 3.27.0 Dec 18, 2024

### Enhancements:
- Enable custom boto3 client parameters for `S3ArtifactStorage` (sbatchelder)
- Return `None` for `run.artifact_uri` if not set (sbatchelder)
- Enable custom contexts for `PytorchLightning` logger (sbatchelder)

### Fixes:
- Fix aggregated metrics' computations (mihran113)
- Fix bug in RunStatusReporter raising non-deterministic RuntimeError exception (VassilisVassiliadis)
- Fix tag addition issue from parallel runs (mihran113)
- Handle `StopIteration` exception in iter_sequence_info_by_type method (alberttorosyan)

## 3.26.1 Dec 3, 2024
- Re-upload after PyPI size limitation fix

## 3.26.0 Dec 3, 2024

### Enhancements:
- Improved performance of metric queries by sequence metadata separation (alberttorosyan)
- Add statistics dump script for basic troubleshooting (alberttorosyan)

## 3.25.1 Nov 6, 2024
- Fix corruption marking on empty index db (mihran113)

## 3.25.0 Oct 2, 2024

### Enhancements:
- Add ability to create reports (mihran113)
- Add support for self-signed SSL certificates (mihran113)


## 3.24.0 Aug 14, 2024

### Enhancements:
- Add read-only mode for Aim UI (mihran113)
- Support of mass updates in remote tracking (peter-sk)

### Fixes:
- Fix bug in bookmark page where it was not scrollable if there was too many bookmarks (vinayan3)
- Fix exception name in `storage/union.pyx` (sulan)

## 3.23.0 Jul 15, 2024

### Enhancements:
- Relax `numpy` version upper bound to include `numpy<3` (judahrand)
- Add a `-s`/`--skip-if-exists` option to the `init` command to avoid reinitializing a repo if one already exists (stevenjlm)

### Fixes:
- Fix SB3 callback metric tracking (mihran113)
- Prevent long waiting times when connecting to incorrect or unresponsive addresses (xuzhiy)

## 3.22.0 Jun 20, 2024

### Enhancements:
- Add filesystem-based backend for artifact storage (gpascale)

## 3.21.0 Jun 17, 2024

### Enhancements:
- Add feature to delete full experiments (mauricekraus)
- Add support for python 3.12 (mahnerak)

### Fixes:
- Increase websockets max_size for large images sent to server (jasonmads)
- Correct flags when running Aim UI in Jupiter notebooks (synapticarbors)

## 3.20.1 Jun 3, 2024

### Enhancements:
- Repurpose aim reindex command for index db recreation (mihran113)

### Fixes
- Handle index db corruption and warn in UI (mihran113)
- Handle and skip corrupted runs (alberttorosyan)

## 3.19.3 Apr 17, 2024
- Resolve issue with new runs after tracking queue shutdown (mihran113)
- Reset base path when opening new tabs (mihran113)

## 3.19.2  Mar 22, 2024
- Resolve live update failing issue (mihran113)
- Resolve issue with remote tracking protocol probe fail (mihran113)

## 3.19.1 Mar 14, 2024
- Accept calls on tracking server without trailing slashes (mihran113)

## 3.19.0 Mar 13, 2024

### Enhancements:
- Replace grpc with http/ws as transport for aim tracking server (mihran113)
- Remove `aim storage upgrade 2to3` command (mihran113)
- Allow HF callback to initialize run at on_init_end for tracking custom metrics with callback (dushyantbehl)
- Support artifacts logging and storage in AWS S3 (alberttorosyan)
- Always set run name when initializing Run in lightning callback (martenlienen)

### Fixes
- Allow the web UI to serve assets symlinked into the static files directory (martenlienen)

## 3.18.1 Feb 7, 2024

### Enhancements:

- Add support for `sqlalchemy 2.0` (mihran113)
- Add `min/max/first` values tracking and visualization for metrics (mihran113, KaroMourad)

### Fixes
- Fix pytorch_lightning aliases issue (popfido)
- Fix typos in stat.py to collect gpu memory and power correctly (ChanderG)
- Fix bug in pytorch lightning raising lock timeout (inc0)
- Fix compatibility with `sqlalchemy < 2.0` versions (mihran113)
- Switch to patched version of official `pynvml` (mihran113)
- Remove telemetry tracking (mihran113)

## 3.17.5 Jun 2, 2023

- Fix gpu stat collection when driver is not loaded (mihran113)
- Fix issue with overflowing box content in full-view mode in Base Explorers (KaroMourad)
- Resolve tags list visibility issue in tags page (arsengit)
- Fix issue on git stat collection (mihran113)
- Import `Image` and `Audio` for `TensorboardFolderTracker` (alansaul)
- Extend `aim.ext.tensorboard_tracker.run.Run` to allow stdout logging and system stats and parameter logging (alansaul)
- Add the ability for `TensorboardFolderTracker` to track `Histogram`'s as Aim `Distribution`'s (alansaul)
- Convert NaNs and Infs in responses to strings (n-gao)
- Add activeloop deeplake plugin (drahnreb)

## 3.17.4  May 4, 2023

- Resolve run messages duplication issue for in progress runs (roubkar)
- Fix metric values inconsistency with steps (mihran113)
- Enable CLI for remote repos (mihran113)
- Safe force-acquire index lock using meta-locks (alberttorosyan, mihran113)
- Fix the issue with containers left open (mihran113)
- Fix issue with notebook extension start-up (mihran113)
- Disable SDK events tracking with Segment API (alberttorosyan)

## 3.17.3 Apr 6, 2023

- Fix the community popup overflowing issue (KaroMourad)
- Optimize images blobs URI loading performance (asynclee)

## 3.17.2 Mar 28, 2023

- Fix explorer crashing issue caused by adding a `displayName` property in Grouping component (KaroMourad)

## 3.17.1 Mar 24, 2023

- Avoid explorer crashing when accessing empty chart values (KaroMourad)

## 3.17.0 Mar 24, 2023

### Enhancements
- Expose `run_name` and `run_hash` parameters to the `aim.sdk.adapters.pytorch_lightning.AimLogger` adapter (constd)
- Add navigation link to Experiment page from the Run page (roubkar)
- Add navigation to explorers from the Run page (roubkar)
- Implement Metrics Explorer v2 via Base Explorer (KaroMourad)
- Add Text Explorer to filter and compare text (roubkar)
- Add groundwork for the UI kit v2 for improved usability (arsengit)

### Fixes

- Add support for Path type to the repo attribute of the Run class (emekaokoli19)
- Add support for jax>0.4.0 (n-gao)
- Add -y option to Aim CLI commands (emekaokoli19)
- Fix issue with toggling lines visibility during live update (roubkar)
- Fix the issue when HF model doesn't have `num_labels` attribute (mihran113)
- Fix table cell scrolling issue in the Texts tab of the Run page (roubkar)

## 3.16.2 Mar 3, 2023

- Add exception-free mode to Aim (alberttorosyan)
- Expose `capture_terminal_logs` argument for `aim.sdk.adapters` classes (mihran113)
- Handle inconsistency between Sequence data and metadata (alberttorosyan)

## 3.16.1 Feb 27, 2023

- Pin package version `alembic>=1.5.0` (justinvyu)
- Fix segment `flush()` issue with no internet access (alberttorosyan)
- Fix the issue with an empty-illustrations styles on Base explorers (KaroMourad)
- Add 'join community' popup to the sidebar (KaroMourad)
- Use non-strict mode when logging HF model metadata (alberttorosyan)
- Add set() method implementation in ProxyTree/SubtreeView classes (alberttorosyan)

## 3.16.0 Feb 3, 2023

### Enhancements

- Drop support for python3.6 (mihran113)
- Add support for python3.11 (alberttorosyan)
- Add other x-axis alignment and system logs tracking to cli convert wandb (hjoonjang)
- Add support for pre-binned distribution/histogram (YodaEmbedding)
- Display logged run messages in Run page (VkoHov, alberttorosyan, roubkar)
- Use read-only mode when opening container for indexing (alberttorosyan)
- Add Stable-Baselines3 integration (tmynn)
- Add Acme integration (tmynn)
- Add huggingface/datasets integration (tmynn)
- Enable support for protobuf v4 (mihran113)
- Support events signaling for Remote Tracking server (alberttorosyan)
- Enhance DVC parameters tracking (tmynn)
- Add SDK events tracking (alberttorosyan)
- Add the ability to easily copy run hash with a single click (VkoHov)
- Add Prophet integration (grigoryan-davit)
- Add 'Dataset' type support for hf/datasets (tmynn)
- Add HuggingFace Transformers model info (tmynn)
- Add multidataset logging support for HuggingFace transformers (tmynn)

### Fixes

- Fix gpu stats logging when some stats are unavailable (timokau)
- Sub-path support for RTS addresses (mihran113)
- Fix experiment name update issues (mihran113)
- Fix run experiment setting race conditions (mihran113)
- Fix the issue with runs not appearing on UI (mihran113)

## 3.15.2 Dec 23, 2022

- Change logging level for reporter debug messages (alberttorosyan)
- Fix styling issues on the experiment page (KaroMourad)
- Fix client side worker port calculation for RTS (mihran113)
- Add discord community link in the sidebar (arsengit)
- Display experiments descriptions in the explorers tables (arsengit)

## 3.15.1 Dec 1, 2022

- Fix issue with index container lock for older repos (mihran113)
- Fix issue with rendering incorrect empty-illustration content in Audios explorer (KaroMourad)

## 3.15.0 Nov 26, 2022

### Enhancements:

- Implement Aim callbacks system and extended notifications (alberttorosyan)
- Add chart legends to the Metrics Explorer (KaroMourad)
- Implement vertically scalable version of Remote Tracking (mihran113, alberttorosyan)
- Add the ability to search, filter, and compare audio through Audios Explorer (VkoHov)
- Add epoch tracking for PyTorch Lightning (tmynn)
- Add PaddlePaddle integration (tmynn)
- Add Optuna integration (tmynn)
- Use `packaging` to parse version strings (jangop)
- Implement the experiment page for the overall experiment info view (VkoHov)
- Implement dynamic flushing mechanism for `CheckIn`s based on the flag (mahnerak)
- Implement robust locking and indexing mechanism for Aim Runs (alberttorosyan)

### Fixes:

- Fix multiple progress bars handling for terminal logs capturing (mihran113)
- Handle resources when multiple `Ctrl-C`s are pressed (alberttorosyan)
- Remove non unicode symbols from `aim up` command logs (mihran113)
- Fix "Show Table Diff" for list type elements in runs, params and scatters explorers (kumarshreshtha)
- Support non-Latin chars for encoding in Aim UI (roubkar)
- Make new `CheckIn`s always override the expiry date, consistent to what is documented (mahnerak)

## 3.14.4 Nov 11, 2022

- Fix dropdowns' selected options losses in time of searching other options in Figures Explorer (rubenaprikyan)
- Fix the group property name visibility in the images and audio tabs (VkoHov)
- Change the color contrast of the icons in the manage columns popover (VkoHov)
- Add notifier config files to aim package (alberttorosyan)
- Fix audios to numpy conversion (mihran113)

## 3.14.3 Oct 29, 2022

- Fix search for empty queries in explorers (KaroMourad)

## 3.14.2 Oct 28, 2022

- Add support to sync explorer state through url on Base and Figures Explorers (rubenaprikyan)
- Add support to highlight syntax error in Figures Explorer (KaroMourad)
- Fix issue with applying solid stroke styles on stroke badge in table (KaroMourad)
- Fix active runs indicators overlapping issue in LineChart (KaroMourad)
- Add support for text style formatting in the logs tab (VkoHov)
- Fix "`TypeError: check()` keywords must be strings" for `Run.metrics()` method (alberttorosyan)
- Fix run info API call error when tag color/description is None (alberttorosyan)
- Fix remote heartbeat resource cleanup (mihran113)

## 3.14.1 Oct 7, 2022

- Fix the current release duplication highlighting issue on the Dashboard page (arsengit)

## 3.14.0 Oct 6, 2022

### Enhancements:

- Move `aim reindex` command under `aim storage` group (mihran113)
- Add the ability to attach/remove tags on the Run Page (roubkar)
- Support dictionary as an argument of `Run.track` (alberttorosyan)
- Display the tags of the run in the tables of the explorers (VkoHov)
- Revamp Figures explorer controls and grouping sections for better onboarding and usability (VkoHov, KaroMourad)
- Replace the spinner loader with a lighter one (VkoHov)
- Add fast.ai integration (tmynn)
- Add command for dangling params cleanup (mihran113)
- Add top and bottom appearance modes to the chart popover (VkoHov)
- Deprecate Python 3.6 (alberttorosyan)
- Add MXNet integration (tmynn)
- Create a Dashboard page to provide a better onboarding experience (arsengit, roubkar, KaroMourad, mihran113)
- Add support for tracking jax device arrays (mihran113)

### Fixes:

- Fix chart hovering issue occurring when "nan" values are tracked (KaroMourad)
- Use empty dict as default when getting Run params (alberttorosyan)
- Change unit-tests data isolation mechanism (alberttorosyan)
- Adjust the visibility of the run color in tables (VkoHov)
- Fix response headers for remote tracking server (mihran113)
- Fix `TypeError`s in single run page (mihran113)

## 3.13.4 Sep 25, 2022

- Add the ability to disable smoothing explicitly (KaroMourad)
- Virtualize the run params list in the Run page (roubkar)

## 3.13.3 Sep 16, 2022

- Fix request cancellation on `Logs` tab (mihran113)
- Fix the data live update handling in the Logs tab (VkoHov)

## 3.13.2 Sep 10, 2022

- Fix content overlapping issue of x-axis alignment dropdown (KaroMourad)
- Fix the regression line rendering issue on Scatter plot exported image (KaroMourad)

## 3.13.1 Sep 1, 2022

- Add support for querying metrics by last value (mihran113)
- Fix aim reindex command failure (alberttorosyan)
- Fix issue with remote runs re-open (mihran113)
- Deprecate custom set Run.hash values (alberttorosyan)
- Tune mlflow converter run properties (tmynn)
- Fix `AimLogger` deprecation issues related to release of PyTorch Lightning v1.7 (djwessel)

## 3.13.0 Aug 21, 2022

### Enhancements:

- Add Figures Explorer to visualize and compare plotly figures (rubenaprikyan, KaroMourad, arsengit, VkoHov, roubkar)
- Add Base Explorer as core of all explorers (rubenaprikyan, KaroMourad, arsengit, VkoHov, roubkar)
- Add logging for remote resource cleanup and network stability (mihran113)
- Restrict Run.hash to auto-generated values only (alberttorosyan)
- Add ability to compare selected runs from the table (arsengit)
- Notify users about failed/stalled runs (mahnerak, alberttorosyan)
- Add ability to pin metrics in Run Page (mihran113, roubkar)
- Add step for unit tests for nightly releases workflow (mihran113)
- Add Keras-Tuner integration (tmynn)
- Add Weights & Biases to Aim log converter (tmynn)

### Fixes:

- Fix chart exporting issue (KaroMourad)
- Fix aim ui rendering issue on notebooks (rubenaprikyan)
- Fix live update retry to show live data after solving connection problems with the server (rubenaprikyan)
- Fix tensorboard convert while converting tensor (sharathmk99)
- Fix incorrect column keys of metrics in the table grid of the runs dashboard (VkoHov)
- Fix git info collection (mihran113)
- Fix code block content and query copying functionality (arsengit)
- Provide compatibility between plotly and matplotlib (tmynn)
- Warn to use aim.Image if aim.Figure fails (tmynn)

## 3.12.2 Aug 5, 2022

- Fix formatting of empty metric contexts (VkoHov)
- Apply lazy loading on metrics in Run Page (roubkar)

## 3.12.1 Aug 2, 2022

- Loosen version requirements for grpcio (alberttorosyan)
- Fix remote heartbeat-watcher resource cleanup (mihran113)
- Break long metric names into multiple lines in Run Page (roubkar)
- Enable run filtering by metric values (mihran113)
- Fix Cython version to eliminate build errors (mihran113)

## 3.12.0 Jul 22, 2022

### Enhancements:

- Add ability to set axes range manually for line charts on UI (KaroMourad)
- Add more user-friendly querying for dates (mihran113, arsengit)
- Filter redundant tooltip data from URL config state (KaroMourad)
- Improve rendering performance by enhancing table columns virtualization mechanism (roubkar)
- Increase visibility and usability of the Show table diff button (arsengit)
- Add support for tensorboard audios conversion (mihran113)
- Format params keys/paths properly (VkoHov)
- Mention explicitly run params everywhere params is mentioned (VkoHov)
- Add ability to hide a batch of items in explorers (VkoHov)
- Add ability to sort by the last value of the metric in table (VkoHov)
- Preserve active line even if it is dropped out of the filtered area (VkoHov)
- Add run duration property for SDK and queries (mihran113)
- Add client vs server version check for remote tracking server (mihran113)
- Add Remote tracking client heartbeat (mihran113)

### Fixes:

- Tune table sorting icon box overlapping with column box in compact mode (KaroMourad)
- Fix tensorboard log conversion for images (mihran113)
- Check if gradient is None when tracking gradient distributions (kage08)
- Fix displaying non-syntax errors across Aim UI (arsengit)
- Fix queries on remote repos (mihran113)
- Fix interval progress reports for query apis (mihran113)
- Fix query request cancellation errors (mihran113)
- Auto-detect and address inconsistencies in meta and series trees (mahnerak)

## 3.11.2 Jul 8, 2022

### Enhancements:

- Display the error position when getting syntax errors after searching (arsengit)

### Fixes:

- Avoid saving crashed or terminated search requests as the last state on explorers (arsengit)
- Remove the progress bar blinking when searching runs in Runs Explorer (KaroMourad)
- Fix the "matched runs" sentence color style in progress bars (KaroMourad)
- Fix `SyntaxError` handling for python3.10+ (mihran113)
- Fix generic Exceptions handling and adjust HTTPException handling (alberttorosyan)

## 3.11.1 Jun 27, 2022

- Replace base58 encoder with base64 (KaroMourad, VkoHov)
- Fix Notes tab loading issue (arsengit)
- Fix the loading logic of the `monaco editor` across the Aim Ui (arsengit)
- Fix `Table` export functionality in Params and Scatters explorers (arsengit)
- Allow mixing numeric types on a single Sequence (alberttorosyan)

## 3.11.0 Jun 21, 2022

### Enhancements:

- Add `--uds` option for `aim up` command (mihran113)
- Add progress reporting for search APIs and tqdm progress for SDK queries (mihran113)
- Add all the attributes of runs in the grouping popovers (KaroMourad)
- Display progress bar on Explorer pages when searching metadata (KaroMourad)
- Improve the processing speed for tb to aim converter (osoblanco)
- Adjust charts hover attributes position calculation and styles (KaroMourad)
- Improve formatting of numbers by setting maximum precision (KaroMourad)
- Add cloud storage backups to AWS S3 for aim repo runs (karan2801)
- Add LightGBM integration example (gorarakelyan)
- Add descriptive document titles for pages (KaroMourad)
- Implement unit-tests for aim SDK utils (yeghiakoronian)
- Display std.dev/err aggregated values in the table (VkoHov)
- Add `active` state indicator property for `aim.Run` (mihran113)
- Add `active` state indicators on the chart (VkoHov)
- Add ability to edit run name and description of run (VkoHov)
- Show the description in the sidebar of the run overview tab (VkoHov)
- Add all the attributes of run in the tooltip (VkoHov)
- Optimize the initial render time of Aim UI by using more lightweight font-family (arsengit)
- Use monaco editor as the syntax highlighter across the Aim UI (arsengit)
- Add loader to the top of the logs box in the run page (VkoHov)
- Add the date and the duration of run in the header of the single run page (VkoHov)
- Add the name, status and duration of run in the runs table of the tags page (VkoHov)
- Fit long name values in manage columns popover (arsengit)
- Add caching mechanism for sequence queries to optimize query performance (mihran113)
- Use step random hash as a key for metric sequences (alberttorosyan)

### Fixes:

- Fix issue with tensorboard to aim conversion (osoblanco)
- Fix reset zoom history on alignment type change (KaroMourad)
- Fix issue with rendering incorrect data when x-axis aligned by `relative time/epoch` (KaroMourad)
- Fix LineCart axis ticks overlapping issue on log scale (KaroMourad)
- Change zooming default option to multiple (VkoHov)
- Change grouped rows' min and max values names to `Group Min` and `Group Max` (VkoHov)
- Preserve the search input value of the grouping dropdown (VkoHov)
- Change the titles and placeholders in popovers (VkoHov)
- Resolve typing latency issue in the query search input (arsengit)
- Reorder and add non-hideable table columns (arsengit)
- Change the font of the runs navigation popover (VkoHov)
- Keep color persistence state after page reload (VkoHov)
- Resolve content blinking issue after search in the run page (arsengit)
- Fix scroll to bottom on live-update in logs tab (VkoHov)
- Fix timezone issues for activity map (mihran113)
- Fix `aim up` command output when `--port 0` is passed (mihran113)

## 3.10.3 May 31, 2022

- Adjust the content overflowing of the Delete and the Archive modals (VkoHov)
- Resolve issue with redirect in run page (arsengit)

## 3.10.2 May 26, 2022

- Adjust SRP Logs row height calculation (VkoHov)
- Fix issue with live update requests scheduler (rubenaprikyan)
- Fix log capturing crash during run garbage collection (mihran113)
- Fix Pytorch Lightning adapter `finalize` method (mihran113)
- Fix params duplication in dropdowns (VkoHov)
- Skip system params in Explorer pages (alberttorosyan)

## 3.10.1 May 18, 2022

- Resolve issue with rendering run params in the overview tab of SRP (arsengit)
- Fix issue with search query state update (arsengit)

## 3.10.0 May 17, 2022

### Enhancements:

- Add ability to adjust the density of the visible content in tables (roubkar)
- Set `metric.name` as default option for grouping (roubkar)
- Show user-selected params before group config in chart popover (roubkar)
- Optimize stream decoding performance on UI (mahnerak)
- Add support for animated image formats to Aim Image object (devfox-se)
- Add `AimLogger` for Catboost (devfox-se)
- Add `AimCallback` for LightGBM (devfox-se)
- Keep the extents of `HighPlot` axes brush in the state and the URL (VkoHov)
- Integrate `aim` with `cimport`-able `aimrocks` (mahnerak)
- Add `__slots__` to some classes to improve performance (mahnerak)
- Define base abstractions for `Iterator` and `DB` by borrowing from `aimrocks` (mahnerak)
- Use `KeysIterator` and `ValuesIterator` wrappers instead of reimplementing (mahnerak)
- Rename `PrefixView.container` to `PrefixView.parent` (mahnerak)
- Reimplement `absolute_path` (mahnerak)
- Cython bindings for `PrefixView`, `TreeView`, `Container`, `ArrayView` (mahnerak)
- Add ability to track and visualize stdout/stderr (mihran113, VkoHov)
- Fix `AimLogger` deprecation issues related to release of PyTorch Lightning v1.5 (arnauddhaene)
- Enable better autocomplete experience with monaco editor (arsengit)
- Pre-loading and caching necessary resources, add pre-loader animation to Aim UI (arsengit)

### Fixes:

- Remove hard-coded installation of pre-requirements (mahnerak)
- Remove duplicate code from `TreeView` and `Container` methods (mahnerak)
- Fix issue with filtering metrics values in single run page (KaroMourad)

## 3.9.4 May 12, 2022

- Fix run remote tracking queue cleanup (mihran113)
- Fix HF callback before training access (mihran113)
- Fix compatibility with Jinja 3.1 (devfox-se)

## 3.9.3 May 10, 2022

- Fix affecting stroke types after changing color persistence (KaroMourad)

## 3.9.2 Apr 29, 2022

- Move aim_ui package data to separate directory (devfox-se)

## 3.9.1 Apr 29, 2022

- Move aim_ui package data to separate directory (devfox-se)

## 3.9.0 Apr 29, 2022

### Enhancements:

- Add `Notes Tab` to single run page (arsengit)
- Add the run name to the batch delete and the batch archive modals (VkoHov)
- Increase the scalability of rendering lines in charts (KaroMourad)
- Increase live update requests delay to prevent performance issues (rubenaprikyan)
- Change font-family to monospace in the Table component (arsengit)
- Add info massage for single value sliders (VkoHov)
- Add `--log-level` argument for aim up/server commands (mihran113)
- Add notes backend api interface (devfox-se)
- Fix type hints in `Repo` class (uduse)

### Fixes:

- Fix LineChart y-dimension margin calculation (KaroMourad)
- Fix HighPlot lines partially rendering issue (KaroMourad)
- Fix HighPlot axis ticks overlapping issue (KaroMourad)
- Fix sorting Params/Scatters explorer axis ticks (KaroMourad)
- Fix compatibility with pytorch-lightning v1.6.0 (mihran113)
- Fix the image's original size cropping (VkoHov)
- Fix `PATH` related issues for `alembic` and `uvicorn` (mihran113)
- Fix queries for custom object APIs (mihran113)
- Fix chart height updating when resize mode changed (VkoHov)
- Fix HuggingFace callback context capturing (mihran113)
- Fix Params/Scatters explorers' row hiding functionality (VkoHov)
- Fix Profiler logs are saved outside repo directory (devfox-se)

## 3.8.1 Apr 6, 2022

- Encode run hash before including in CSS selectors (Hamik25)
- Fix displaying incorrect metric values for large range scale in LineChart (KaroMourad)
- Fix issue with rendering lines for large range scale in LineChart (KaroMourad)
- Fix issue with URL state sync for bookmarks (roubkar)
- Fix issue with displaying negative param values on Aim UI (roubkar)
- Fix row hiding functionality (roubkar)
- Tune RunOverviewTab container styles (arsengit)
- Update documentations links on UI (rubenaprikyan)
- Fix `RepoIndexManager` run's reference cleanup (mihran113)
- Fix remote run finalization (mihran113)
- Fix issue with fetch on load more (infinite scroll) functionality in Runs Explorer (rubenaprikyan)

## 3.8.0 Mar 26, 2022

### Enhancements:

- Hugging Face adapter refactoring (mihran113)
- Add run description columns to all run specific tables (VkoHov, mihran113)
- Change images rendering optimization default value to smoother (VkoHov)
- Set default steps ordering to desc in single run tabs (VkoHov, devfox-se)
- Add run name to grouping, ordering and run navigation popovers (VkoHov)
- Add ability to apply color scale on columns with numeric values (VkoHov)
- Refactored XGBoost AimCallback (devfox-se)
- Reopenable callbacks for integrations (mihran113)
- Add DVC integration (devfox-se)
- Add API profiler and unified API error response (devfox-se)
- Add API to retrieve N'th step of sequence (devfox-se)

### Fixes:

- Fix issue with calculation of active point on mouse hover in the LineChart (KaroMourad)
- Fix issue with wrong URL caching for Explorer pages (roubkar)
- Fix issue with focusing on the chart active point while moving the cursor (KaroMourad)
- Fix the image full view toggle icon visibility if the image has a white background (VkoHov)
- Fix scroll to the end of the audio tab (VkoHov)
- Add scrollbar to image full view mode content (VkoHov)
- Fix issues with run name/description not being set (mihran113)
- Fix issue with run single page tabs result caching (mihran113)
- Fix git system param tracking (devfox-se)
- Fix runs manual closing (mihran113)
- Fix Docker image creation step in packaging workflow (alberttorosyan)
- Fix Jinja2 template rendering with starlette==0.14.2 (alberttorosyan)

## 3.7.5 Mar 18, 2022

- Add request aborting functionality in single run page tabs (arsengit)
- Render plotly figures properly in single run page (arsengit)

## 3.7.4 Mar 15, 2022

- Fix density min and max validation calculation (VkoHov)

## 3.7.3 Mar 14, 2022

- Add missing names for dynamically imported files in single run page (arsengit)

## 3.7.2 Mar 10, 2022

- Fix issue with rendering UI re keeping long URL (KaroMourad)
- Split code in the single run page to optimize chunk size (arsengit)

## 3.7.1 Mar 10, 2022

- Fix metric queries with epoch=None (alberttorosyan)

## 3.7.0 Mar 9, 2022

### Enhancements:

- Add Run overview tab in run single page (arsengit, VkoHov, KaroMourad, rubenaprikyan)
- Custom max message size for Aim Remote tracking (alberttorosyan)
- Docker images for aim up/server (alberttorosyan)
- TF/Keras adapters refactoring (mihran113)
- Remote tracking client-side retry logic (aramaim)
- Add record_density to initial get-batch request for figures (VkoHov)

### Fixes:

- Fix rendering new lines in texts visualizer (arsengit)

## 3.6.3 Mar 4, 2022

- Fix UI rendering issue on colab (rubenaprikyan)

## 3.6.2 Mar 2, 2022

- Fix chart interactions issue in the Single Run Page Metrics tab (roubkar)
- Fix `resolve_objects` in remote tracking client subtree (alberttorosyan)
- Reject `0` as step/record count (alberttorosyan, VkoHov)
- Fix error on mlflow conversion by experiment id (devfox-se)

## 3.6.1 Feb 25, 2022

- Fix issue with aligning x-axis by custom metric (KaroMourad)
- Add `__AIM_PROXY_URL__` env variable to see full proxy url when running `aim up` command(rubenaprikyan)
- Add `--proxy-url` argument to notebook extension's `%aim up` to render UI correctly if there is a proxy server (rubenaprikyan)
- Add SageMaker integration, `jupyter-server-proxy` s bug-fix script (rubenaprikyan, mahnerak)
- Fix animation support in Plotly visualization and figure loading performance (Hamik25, mihran113)
- Display `None` values in group config column (VkoHov, Hamik25)
- Fix rendering issue on `Select` form search suggestions list (arsengit)
- Fix PL.AimLogger save_dir AttributeError (GeeeekExplorer)
- Remove `__example_type__` substring from param name (VkoHov)

## 3.6.0 Feb 22 2022

### Enhancements:

- Sort params columns in alphabetical order (arsengit)
- Add illustrations for indicating explorer search states (arsengit)
- Ability to export chart as image (KaroMourad)
- Ability to group by metric.context (VkoHov)
- Tune manage columns items highlighting styles (VkoHov)
- Set active style on table actions popover buttons with applied changes (arsengit)
- Unification of Run Custom Object APIs (alberttorosyan, VkoHov)
- Aim repo runs data automatic indexing (alberttorosyan)
- Pytorch Lightning adapter refactoring (mihran113)
- Add Pytorch Ignite integration (mihran113)
- Add wildcard support for `aim runs` subcommands (mihran113)
- Add MLflow logs conversion command (devfox-se)
- Add CustomObject implementation for `hub.dataset` (alberttorosyan)

### Fixes:

- Fix live updated data loss after triggering endless scroll (VkoHov)
- Fix system metric columns pinning functionality and grouping column order (arsengit)
- Fix system metrics search in manage columns popover (VkoHov)
- Fix queries on remote repos (mihran113)
- Fix incorrect boolean value formatting (VkoHov)

## 3.5.4 Feb 15 2022

- Fix batch archive functionality (VkoHov)
- Add repo lock/release feature (devfox-se)

## 3.5.3 Feb 11 2022

- Fix rendering issue in runs explorer page (arsengit)

## 3.5.2 Feb 10 2022

- Fix issue with displaying current day activity cell on week's first day (rubenaprikyan)
- Fix issue with filtering options while typing in input of autocomplete in Tooltip and Grouping popovers (rubenaprikyan)

## 3.5.1 Feb 4 2022

- Fix folder creation when tracking with remote tracker (aramaim)

## 3.5.0 Feb 3 2022

### Enhancements:

- Ability to hide system metrics from table (arsengit)
- Add input validations to range selectors (Hamik25)
- Improve media panel rendering performance on hovering over images (KaroMourad)
- Add ability to parse and import TensorFlow events into aim (devfox-se)
- Add system parameter logging: CLI, Env, Executable, Git, Installed packages (devfox-se)
- Convert nested non-native objects (e.g. OmegaConf config instance) upon storing (devfox-se)
- Add cli subcommands cp and mv for aim runs command (mihran113)
- Add handler for matplotlib figures in Image and Figure custom objects (devfox-se)
- Improve highlighting of table focused/hovered/selected row (VkoHov)

### Fixes:

- Fix stalled runs deletion (mihran113)
- Fix background transparency in colab when using dark mode of system (rubenaprikyan)
- Fix Grouping and Tooltip popovers states' resetting issue when live-update is on (rubenaprikyan)
- Fix table column's sort functionality issue in Params and Scatters Explorers (rubenaprikyan)

## 3.4.1 Jan 23 2022

- Fix issue with displaying experiment name in Images Explorer table (VkoHov)

## 3.4.0 Jan 22 2022

- Add ability to apply group stacking on media elements list (KaroMourad)
- Add ability to apply sorting by run creation_time on table rows (roubkar)
- Add ability to filter texts table with keyword matching (roubkar, rubenaprikyan)
- Add ability to delete run from settings tab (Hamik25)
- Enhance controls states of explorer pages (arsengit)
- Add --repo, --host arguments support for notebook extension (VkoHov, rubenaprikyan)
- Add trendline options to ScatterPlot (roubkar)
- Add ability to display images in original size and align by width (arsengit)
- Add version, docs and slack links to sidebar (arsengit)
- Enhance AudioPlayer component (arsengit)
- Recover active tab in run details page after reload (roubkar)
- Add ability to archive or delete runs with batches (VkoHov)
- Remote tracking server [experimental] (alberttorosyan, mihran113, aramaim)
- Add ability to change media elements order (VkoHov)
- Add ability to hard delete runs (alberttorosyan)
- Lossy format support for aim.Image (devfox-se)
- Timezone issues fix for creation and end times (mihran113)

## 3.3.5 Jan 14 2022

- Add non-strict write mode to replace not-yet-supported types with their
  string representations. (mahnerak)
- Log pytorch_lightning hyperparameters in non-strict mode. (mahnerak)

## 3.3.4 Jan 10 2022

- Fix issue with WAL files flushing (alberttorosyan)
- Support for omegaconf configs in pytorch_lightning adapter (devfox-se)

## 3.3.3 Dec 24 2021

- Fix issue with showing range panel in Images Explorer (roubkar)

## 3.3.2 Dec 20 2021

- Fix issue with not providing point density value to live-update query (rubenaprikyan)

## 3.3.1 Dec 18 2021

- Fix getValue function to show correct chart title data (KaroMourad)

## 3.3.0 Dec 17 2021

- Add ability to track and explore audios in run detail page (arsengit, VkoHov, devfox-se)
- Add ability to track and visualize texts (mihran113, roubkar)
- Fix boolean values encoding (mahnerak)
- Add Scatter Explorer to visualize correlations between metric last value and hyperparameter (KaroMourad)
- Add ability to track and visualize plotly objects (devfox-se, Hamik25, rubenaprikyan)
- Add ability to query distributions by step range and density (VkoHov, rubenaprikyan)
- Add colab notebook support (mihran113, rubenaprikyan)
- Implement images visualization tab in run detail page (VkoHov, KaroMourad)
- Add custom URL prefix support (mihran113, Hamik25, roubkar)
- Enhance metric selection dropdowns to see lists in alphabetical order (rubenaprikyan)

## 3.2.2 Dec 10 2021

- Fix Run finalization index timeout issue (alberttorosyan)

## 3.2.1 Dec 8 2021

- Add ability to provide custom base path for API (mihran113, roubkar)
- Fix table groups column default order (arsengit)
- Fix table panel height issue in runs explorer page (arsengit)

## 3.2.0 Dec 3 2021

- Add ability to cancel pending request (roubkar, arsengit)
- Add support for secure protocol for API calls (mihran113, roubkar)
- Implement image full size view (VkoHov)
- Add ability to manipulate with image size and rendering type (arsengit)
- Enhance Table column for selected grouping config options (arsengit)
- Implement suggestions list for AimQL search (arsengit, rubenaprikyan)
- Add ability to track and visualize distributions (mihran113, rubenaprikyan)
- Add notebook extension, magic functions (rubenaprikyan)

## 3.1.1 Nov 25 2021

- Apply default ordering on images set (VkoHov)
- Ability to show image data in a tooltip on hover (KaroMourad)
- Support of Image input additional data sources (alberttorosyan)
- Ability to export run props as pandas dataframe (gorarakelyan)
- Slice image sequence by index for the given steps range (alberttorosyan)
- Improve Images Explorer rendering performance through better images list virtualization (roubkar)

## 3.1.0 Nov 20 2021

- Add ability to explore tracked images (VkoHov)
- Improve rendering performance by virtualizing table columns (roubkar)
- Add ability to apply grouping by higher level param key (roubkar)
- Add ability to specify repository path during `aim init` via `--repo` argument (rubenaprikyan)

## 3.0.7 Nov 17 2021

- Fix for missing metrics when numpy.float64 values tracked (alberttorosyan)

## 3.0.6 Nov 9 2021

- Fix for blocking container optimization for in progress runs (alberttorosyan)

## 3.0.5 Nov 9 2021

- Add tqdm package in setup.py required section (mihran113)

## 3.0.4 Nov 8 2021

- Switch to aimrocks 0.0.10 - exposes data flushing interface (mihran113)
- Optimize stored data when runs finalized (mihran113)
- Update `aim reindex` command to run storage optimizations (alberttorosyan)
- Storage partial optimizations on metric/run queries (alberttorosyan)

## 3.0.3 Nov 4 2021

- Bump sqlalchemy version to 1.4.1 (alberttorosyan)

## 3.0.2 Oct 27 2021

- Switch to aimrocks 0.0.9 - built on rocksdb 6.25.3 (alberttorosyan)
- Remove grouping select options from Params app config (VkoHov)
- Sort metrics data in ascending order for X-axis (KaroMourad)

## 3.0.1 Oct 22 2021

- Check telemetry_enabled option on segment initialization (VkoHov)
- Draw LineChart Y-axis (horizontal) tick lines on zooming (KaroMourad)
- Sort select options/params based on input value (roubkar)
- Fix query construction issue for multiple context items (roubkar)
- Fix issue with making API call from Web Worker (VkoHov)

## 3.0.0 Oct 21 2021

- Completely revamped UI:

  - Runs, metrics and params explorers
  - Bookmarks, Tags, Homepage
  - New UI works smooth with ~500 metrics displayed at the same time with full Aim table interactions

- Completely revamped storage:
  - 10x faster embedded storage based on Rocksdb
  - Average run query execution time on ~2000 runs: 0.784s
  - Average metrics query execution time on ~2000 runs with 6000 metrics: 1.552s

## 2.7.1 Jun 30 2021

- Fix bookmark navigation issue (roubkar)
- Empty metric select on X-axis alignment property change (roubkar)

## 2.7.0 Jun 23 2021

- Add ability to export table data as CSV (KaroMourad)
- Add ability to bookmark explore screen state (roubkar)
- Add dashboards and apps API (mihran113)

## 2.6.0 Jun 12 2021

- Resolve namedtuple python 3.5 incompatibility (gorarakelyan)
- Add ability to align X-axis by a metric (mihran113, roubkar)
- Add tooltip popover for the chart hover state (roubkar)

## 2.5.0 May 27 2021

- Set gunicorn timeouts (mihran113)
- Remove redundant deserialize method (gorarakelyan)
- Move the Flask server to main repo to support 'docker'less UI (mihran113)

## 2.4.0 May 13 2021

- Bump up Aim UI to v1.6.0 (gorarakelyan)
- Add xgboost integration (khazhak)
- Update keras adapter interface (khazhak)
- Convert tensors to python numbers (gorarakelyan)

## 2.3.0 Apr 10 2021

- Bump up Aim UI to v1.5.0 (gorarakelyan)
- Set default interval of sys tracking to 10 seconds (gorarakelyan)
- Add ability to track system metrics (gorarakelyan)

## 2.2.1 Mar 31 2021

- Bump up Aim UI to v1.4.1 (gorarakelyan)

## 2.2.0 Mar 24 2021

- Bump up Aim UI to v1.4.0 (gorarakelyan)
- Add Hugging Face integration (Khazhak)
- Reorganize documentation (Tatevv)

## 2.1.6 Feb 26 2021

- Add ability to opt out telemetry (gorarakelyan)
- Remove experiment name from config file when calling repo.remove_branch method (gorarakelyan)

## 2.1.5 Jan 7 2021

- Handle NaN or infinite floats passed to artifacts (gorarakelyan)

## 2.1.4 Dec 2 2020

- Add ability to specify session run hash (gorarakelyan)
- Initialize repo if it was empty when opening session (gorarakelyan)
- Add validation of map artifact parameters (gorarakelyan)

## 2.1.3 Nov 24 2020

- Support comparison of list type contexts (gorarakelyan)

## 2.1.2 Nov 24 2020

- Fix empty contexts comparison issue (gorarakelyan)

## 2.1.1 Nov 22 2020

- Return only selected params in SelectResult (gorarakelyan)

## 2.1.0 Nov 19 2020

- Add AimRepo select method (gorarakelyan)
- Implement SelectResult class (gorarakelyan)

## 2.0.27 Nov 13 2020

- Fix issue with artifact step initializer (gorarakelyan)

## 2.0.26 Nov 10 2020

- Add `block_termination` argument to aim.Session (gorarakelyan)
- Convert infinity parameter to string in artifacts (gorarakelyan)

## 2.0.25 Nov 9 2020

- Reconstruct run metadata file when running close command (gorarakelyan)

## 2.0.24 Nov 8 2020

- Add SIGTERM signal handler (gorarakelyan)
- Run `track` function in a parallel thread (gorarakelyan)
- Add SDK session flush method (gorarakelyan)
- Flush aggregated metrics at a given frequency (gorarakelyan)
- Update run metadata file only on artifacts update (gorarakelyan)

## 2.0.23 Nov 5 2020

- Make experiment name argument required in SDK close command (gorarakelyan)

## 2.0.22 Nov 5 2020

- Add SDK `close` method to close dangling experiments (gorarakelyan)

## 2.0.21 Nov 1 2020

- Resolve compatibility issues with python 3.5.0 (gorarakelyan)

## 2.0.20 Oct 26 2020

- Enable pypi aim package name (gorarakelyan)

## 2.0.19 Oct 25 2020

- Add PyTorch Lightning logger (gorarakelyan)
- Add TensorFlow v1 and v2 keras callbacks support (gorarakelyan)

## 2.0.18 Oct 7 2020

- Add ability to run Aim UI in detached mode (gorarakelyan)
- Add ability to specify repo path when running Aim UI (gorarakelyan)

## 2.0.17 Oct 5 2020

- Rename `AimDE` to `Aim UI` (gorarakelyan)

## 2.0.16 Oct 2 2020

- Add ability to specify host when running AimDE (gorarakelyan)
- Disable `AimContainerCommandManager` (gorarakelyan)
- Remove `aimde` command entry point (gorarakelyan)
- Remove `de` prefix from development environment management commands (gorarakelyan)

## 2.0.15 Sep 21 2020

- Set Map artifact default namespace (gorarakelyan)

## 2.0.14 Sep 21 2020

- Set Metric hashable context to None if no kwarg is passed (gorarakelyan)

## 2.0.13 Sep 21 2020

- Add ability to query runs by metric value (gorarakelyan)
- Add ability to query runs via SDK (gorarakelyan)

## 2.0.12 Sep 12 2020

- Update Session to handle exceptions gracefully (gorarakelyan)

## 2.0.11 Sep 11 2020

- Add alias to keras adapter (gorarakelyan)

## 2.0.10 Sep 10 2020

- Show progress bar when pulling AimDE image (gorarakelyan)

## 2.0.9 Sep 10 2020

- Add ability to start multiple sessions (gorarakelyan)
- Add Aim adapter for keras (gorarakelyan)

## 2.0.8 Aug 26 2020

- Set SDK to select only unarchived runs by default (gorarakelyan)
- Add ability to archive/unarchive runs (gorarakelyan)
- Enable search by run attributes (gorarakelyan)
- Add `is not` keyword to AimQL (gorarakelyan)

## 2.0.7 Aug 21 2020

- Validate Artifact values before storing (gorarakelyan)
- Add sessions to SDK (gorarakelyan)

## 2.0.6 Aug 13 2020

- Add ability to retrieve metrics and traces from repo (gorarakelyan)
- Add SDK `select` method to select runs and artifacts (gorarakelyan)
- Implement search query language (gorarakelyan)

## 2.0.5 Jul 18 2020

- Fix issue with PyPI reStructuredText format compatibility (gorarakelyan)

## 2.0.4 Jul 18 2020

- Add ability to attach tf.summary logs to AimDE (gorarakelyan)

## 2.0.3 Jul 8 2020

- Pass project path to development environment container (gorarakelyan)

## 2.0.2 Jul 7 2020

- Make `epoch` argument optional for `Metric` artifact (gorarakelyan)
- Add ability to automatically commit runs after exit (gorarakelyan)
- Add `aim up` shortcut for running development environment (gorarakelyan)
- Remove first required argument(artifact name) from sdk track function (gorarakelyan)
- Add general dictionary artifact for tracking `key: value` parameters (gorarakelyan)

## 2.0.1 Jun 24 2020

- Fix inconsistent DE naming (gorarakelyan)

## 2.0.0 Jun 18 2020

- Tidy up aim and remove some artifacts (gorarakelyan)
- Update AimContainerCMD to open connection on custom port (gorarakelyan)
- Save passed process uuid to commit configs (gorarakelyan)
- Ability to query processes (gorarakelyan)
- Execute process and store logs into a commit of specific experiment (gorarakelyan)
- Kill running process and its children recursively (gorarakelyan)
- Keep executed processes for monitoring and management (gorarakelyan)
- Add container command handler to exec commands on the host (gorarakelyan)
- Refactor Text artifact to store sentences using protobuf and aimrecords (jamesj-jiao)
- Add ability to pass aim board port as an argument (gorarakelyan)

## 1.2.17 May 8 2020

- Add config command (gorarakelyan)
- Tune artifacts: images, metric_groups, params (gorarakelyan)

## 1.2.16 Apr 29 2020

- Add ability to pass numpy array as a segmentation mask (gorarakelyan)

## 1.2.15 Apr 29 2020

- Add basic image list tracking (gorarakelyan)

## 1.2.14 Apr 27 2020

- Optimize segmentation tracking insight to load faster (gorarakelyan)

## 1.2.13 Apr 25 2020

- Remove GitHub security alert (gorarakelyan)
- Add image semantic segmentation tracking (gorarakelyan)

## 1.2.12 Apr 20 2020

- Add missing init file for aim.artifacts.proto (@mike1808)

## 1.2.11 Apr 16 2020

- Make epoch property optional for Metric (gorarakelyan)

## 1.2.10 Apr 16 2020

- Serialize and store `Metric` records using protobuf and aimrecords (gorarakelyan)
- Create RecordWriter factory which handles artifact records saving (gorarakelyan)
- Extract artifact serialization to ArtifactWriter (mike1808)

## 1.2.9 Mar 16 2020

- Alert prerequisites installation message for running board (gorarakelyan)

## 1.2.8 Mar 15 2020

- Update profiler interface for keras (gorarakelyan)

## 1.2.7 Mar 14 2020

- Add board pull command (gorarakelyan)
- Change board ports to 43800,1,2 (gorarakelyan)
- Add ability to profile graph output nodes (gorarakelyan)
- Remove issue with autograd inside while loop (gorarakelyan)
- Add aim board development mode (gorarakelyan)
- Update board name hash algorithm to md5 (gorarakelyan)
- Add board CLI commands: up, down and upgrade (gorarakelyan)
- Add ability to tag version as a release candidate (gorarakelyan)

## 1.2.6 Feb 28 2020

- Add learning rate update tracking (gorarakelyan)

## 1.2.5 Feb 25 2020

- Add autocommit feature to push command: `aim push -c [-m <msg>]` (gorarakelyan)
- Add cli status command to list branch uncommitted artifacts (gorarakelyan)
- Add an ability to aggregate duplicated nodes within a loop (gorarakelyan)
- Remove gradient break issue when profiling output nodes (gorarakelyan)

## 1.2.4 Feb 20 2020

- Enable profiler to track nodes inside loops (gorarakelyan)
- Ability to disable profiler for evaluation or inference (gorarakelyan)

## 1.2.3 Feb 13 2020

- Set minimum required python version to 3.5.2 (gorarakelyan)

## 1.2.2 Feb 13 2020

- Downgrade required python version (gorarakelyan)

## 1.2.1 Feb 13 2020

- Edit README.md to pass reStructuredText validation on pypi (gorarakelyan)

## 1.2.0 Feb 13 2020

- Make aim CLI directly accessible from main.py (gorarakelyan)
- Add disk space usage tracking (gorarakelyan)
- Add profiler support for Keras (gorarakelyan)
- Add TensorFlow graph nodes profiler (gorarakelyan)
- Add command to run aim live container mounted on aim repo (gorarakelyan)
- Update profiler to track GPU usage (gorarakelyan)
- Add machine resource usage profiler (gorarakelyan)

## 1.1.1 Jan 14 2020

- Remove aim dependencies such as keras, pytorch and etc (gorarakelyan)

## 1.1.0 Jan 12 2020

- Update code diff tracking to be optional (gorarakelyan)
- Add default False value to aim init function (gorarakelyan)
- Update aim repo to correctly identify cwd (gorarakelyan)
- Update push command to commit if msg argument is specified (gorarakelyan)
- Add ability to initialize repo from within the sdk (gorarakelyan)

## 1.0.2 Jan 7 2020

- Remove objects dir from empty .aim branch index (gorarakelyan)

## 1.0.1 Dec 26 2019

- Add cil command to print aim current version (gorarakelyan)

## 1.0.0 Dec 25 2019

- Add aim version number in commit config file (gorarakelyan)
- Update push command to send username and check storage availability (gorarakelyan)
- Add hyper parameters tracking (gorarakelyan)
- Update push command to print shorter file names when pushing to remote (gorarakelyan)
- Update tracking artifacts to be saved in log format (gorarakelyan)
- Add pytorch cuda support to existing sdk artefacts (gorarakelyan)
- Add cli reset command (gorarakelyan)
- Add nested module tracking support to aim sdk (gorarakelyan)
- Add code difference tracking to aim sdk (gorarakelyan)
- Update aim push command to send commits (gorarakelyan)
- Add commit structure implementation (gorarakelyan)
- Add aim commit command synchronized with git commits (gorarakelyan)
- Add version control system factory (gorarakelyan)
- Update all insights example (gorarakelyan)
- Add model gradients tracking (gorarakelyan)
- Add model weights distribution tracking (gorarakelyan)
- Add aim correlation tracking (gorarakelyan)

## 0.2.9 Nov 30 2019

- Update push tolerance when remote origin is invalid (gorarakelyan)

## 0.2.8 Nov 30 2019

- Update aim auth public key search algorithm (gorarakelyan)

## 0.2.7 Nov 14 2019

- Update dependencies torch and torchvision versions (sgevorg)

## 0.2.6 Nov 5 2019

- Update aim track logger (gorarakelyan)

## 0.2.5 Nov 4 2019

- Add branch name validation (gorarakelyan)
- Add single branch push to aim push command (gorarakelyan)

## 0.2.4 Nov 3 2019

- Update aim auth print format (gorarakelyan)
- Update setup.py requirements (gorarakelyan)

## 0.2.3 Nov 3 2019

- Update package requirements (gorarakelyan)

## 0.2.2 Nov 1 2019

- Update package requirements (sgevorg)

## 0.2.1 Nov 1 2019

- Add paramiko to required in setup.py (sgevorg)

## 0.2.0 Nov 1 2019

- Update the repo to prep for open source pypi push (sgevorg)
- Add error and activity logging (sgevorg)
- Add push command robustness (gorarakelyan)
- Add cli auth command (gorarakelyan)
- Add public key authentication (gorarakelyan)
- Update push to send only branches (gorarakelyan)
- Add branching command line interface (gorarakelyan)
- Update skd interface (gorarakelyan)
- Add pytorch examples inside examples directory (gorarakelyan)
- Add model load sdk method (gorarakelyan)
- Add model checkpoint save tests (gorarakelyan)
- Update file sending protocol (gorarakelyan)
- Add model tracking (gorarakelyan)

## 0.1.0 - Sep 23 2019

- Update setup py to build cython extensions (gorarakelyan)
- Update tcp client to send multiple files through one connection (gorarakelyan)
- Update tcp client to send images (gorarakelyan)
- Update sdk track functionality to support multiple metrics (gorarakelyan)
- Update push command for sending repo to a given remote (gorarakelyan)
- Add cli remote commands (gorarakelyan)
- Update cli architecture from single group of commands to multiple groups (gorarakelyan)
- Add testing env first skeleton and versions (sgevorg)
- Add dummy exporting files from .aim-test (sgevorg)
- Add description for Testing Environment (sgevorg)
- Update metadata structure and handling (sgevorg)
- Add support for seq2seq models (sgevorg)
- Update the output of doker image build to be more informative and intuitive (sgevorg)
- Update README.MD with changed Aim messaging (sgevorg)
- Remove setup.cfg file (maybe temporarily) (sgevorg)
- Update the location for docker build template files, move to data/ (sgevorg)
- Update the `docs/cli.md` for aim-deploy docs (sgevorg)
- Add docker deploy `.aim/deploy_temp/<model>` cleanup at the end of the build (sgevorg)
- Add Docker Deploy via `aim-deploy` command (sgevorg)
- Add Docker image generate skeleton (sgevorg)
- Add AimModel.load_mode static function to parse `.aim` files (sgevorg)
- Update exporter to decouple from specifics of exporting and framework (sgevorg)
- Add model export with `.aim` extension (sgevorg)
- Remove pack/unpack of the metadata (sgevorg)
- Add pack/unpack to add metadata to model for engine processing (sgevorg)
- Add aim-deploy command configuration in cli (sgevorg)
- Add basic cli (sgevorg)
- Update setup.py for cli first version (sgevorg)
- Add initial cli specs (sgevorg)
- Add directories: the initial skeleton of the repo (sgevorg)
- Add gitignore, license file and other basics for repo (sgevorg)
