## Define custom callbacks

Many things can go wrong during ML training (incorrect driver versions, plateaued metrics, etc)
that could result in wasted GPUs and time.
The Aim callbacks API helps to define custom callbacks to be executed at any point during
ML training - a programmable way to guard ML training from wasting resources.

Callbacks can actually encompass any programmable functionality, such as 
[logging messages and sending notifications](./logging.html), or
killing the training process when the given condition is met.

### Callbacks

Terms:
- **callback** - python function that implements a custom logic to be executed at a certain point during the training.
- **callbacks class** - python class to group callback functions. Can be used to share state between different callbacks (example below).
- **event** - represents an event to be bound to the training.

The callbacks API:
- **TrainingFlow** - defines the training flow/events.
- **events.on.*** - decorators to define when the callback function is executed.

The list of currently available training events:
- **events.on.training_started** - called after the training start.
- **events.on.training_successfully_finished** - called after the training is successfully finished, meaning no unexpected exceptions are raised, even a manual keyboard interruption (ctrl+C). Please note that programmatic early stopping is considered as a successful finish.
- **events.on.training_metrics_collected** - called after the training metrics are calculated and ready to be logged. Typically called at each N batches.
- **events.on.validation_metrics_collected** - called after the validation metrics are calculated and ready to be logged. Mostly called only once, after the validation loop is finished.
- **events.on.init** - automatically called after the callbacks class initialization and before all the other events. Must not be called manually. Typical use-case can be initializing a shared state for callback functions (example below).

### Example

The below example demonstrates how to implement custom callbacks to check and notify, when:
- wrong driver versions are installed.
- gnorm metrics explode.
- model starts to overfit.

#### Defining the callbacks

```python
from aim.sdk.callbacks import events

class MyCallbacks:
    @events.on.init  # Called when initializing the TrainingFlow object
    def init_gnorm_accumulators(self, **kwargs):
        # Initialize a state to collect gnorm values over training process
        self.gnorm_sum = 0
        self.gnorm_len = 0

    @events.on.init
    def init_ppl_accumulators(self, **kwargs): 
        # Initialize a state to collect ppl values over training process
        self.ppl_sum = 0
        self.ppl_len = 0

    @events.on.init
    def init_metrics_accumulators(self, **kwargs):
        # Collect only the last 100 appended values
        self.last_train_metrics = deque(maxlen=100)

    # NOTE: all the above methods can be merged into one, 
    #        but are separated for readability reasons

    @events.on.training_started
    def check_cuda_version(self, run: aim.Run, **kwargs):
        if run['__system_params', 'cuda_version'] != '11.6':
            run.log_warning("Wrong CUDA version is installed!")
	
    @events.on.training_metrics_collected
    def check_gnorm_and_notify(
        self, 
        metrics: Dict[str, Any], 
        step: int, 
        # always denotes the number of *training* steps
        # `1 step per 4 batches` can be in case of gradient accumulation
        epoch: int, 
        run: aim.Run,
        **kwargs
    ):
        current = metrics['gnorm'] # notice that it's the last one
        # thus we need to use self.* to collect gnorm values
        self.gnorm_sum += current
        self.gnorm_len += 1
        mean = self.gnorm_sum / self.gnorm_len
        
        if current > 1.15 * mean:
            run.log_warning(f'gnorms have exploded. mean: {mean}, '
                             'step {step}, epoch {epoch} ...')

    @events.on.training_metrics_collected
    def check_ppl_and_notify(
        self, 
        metrics: Dict[str, Any], 
        step: int,
        epoch: int,
        run: aim.Run,
        **kwargs
    ):
        current = metrics['ppl'] # notice that it's the last one
        # thus we need to use self.* to collect ppl values
        self.ppl_sum += current
        self.ppl_len += 1
        mean = self.ppl_sum / self.ppl_len

        if current > 1.15 * mean:
            run.log_warning(f'ppl have exploded. mean: {mean}, '
                             'step {step}, epoch {epoch} ...')
    
    @events.on.training_metrics_collected
    def store_last_train_metrics(
        self,
        metrics: Dict[str, Any],
        step: int,
        epoch: int,
        **kwargs,
    ):
        self.last_train_metrics.append(metrics)

    @events.on.validation_metrics_collected
    def check_overfitting(
        self,
        metrics: Dict[str, Any],
        epoch: int = None,
        run: aim.Run,
        **kwargs,
    ):
        mean_train_ppl = sum(
            metrics['ppl'] for metrics
            in self.last_train_metrics
        ) / len(self.last_train_metrics)

        if mean_train_ppl > 1.15 * metrics['ppl']:
            run.log_warning(f'I think we are overfitting on epoch={epoch}')
```

#### Registering the callbacks

```python
from aim import TrainingFlow, Run

aim_run = Run()

training_flow = TrainingFlow(run=aim_run, callbacks=[MyCallbacks()])
# or
training_flow = TrainingFlow(run=aim_run)
training_flow.register(MyCallbacks())
```
