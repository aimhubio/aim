## Run Aim UI on Hugging Face Spaces

**Hugging Face Spaces** offer a simple way to host ML demo apps directly on your profile or your organization’s profile. This allows you to create your ML portfolio, showcase your projects at conferences or to stakeholders, and work collaboratively with other people in the ML ecosystem.
Hugging Face Spaces make it easy for you to create and deploy ML-powered demos in minutes.

Check out the [Hugging Face Spaces docs](https://huggingface.co/docs/hub/spaces-overview) to learn more about Spaces.

In the following sections, you'll learn how to deploy Aim on the Hugging Face Hub Spaces and explore your training runs directly from the Hub.

### Deploy Aim on Spaces

To get started, simply navigate to the Spaces page on the Hugging Face Hub and click on the “Create new Space” button, or open the page directly by the following link: https://huggingface.co/new-space?template=aimstack/aim

<img src="https://user-images.githubusercontent.com/23078323/231592155-869148a0-9a92-475f-8ebe-34d4deb2abc2.png" alt="Creating an Aim Space" width=800 />

Set up your Aim Space in no time:
- Choose a name for your Space.
- Adjust Space hardware and the visibility mode.
- Submit your Space!

Once you have created the Space, you'll see the `Building` status, and once it becomes `Running,` your Space is ready to go!

Now, when you navigate to your Space's **App** section, you can access the Aim UI.

### Compare your experiments with Aim on Spaces

Let's use a quick example of a PyTorch CNN trained on MNIST to demonstrate end-to-end Aim on Spaces deployment.
The full example is in the [Aim repo examples folder](https://github.com/aimhubio/aim/blob/main/examples/pytorch_track.py).

```python
from aim import Run
from aim.pytorch import track_gradients_dists, track_params_dists

# Initialize a new Run
aim_run = Run()
...
items = {'accuracy': acc, 'loss': loss}
aim_run.track(items, epoch=epoch, context={'subset': 'train'})

# Track weights and gradients distributions
track_params_dists(model, aim_run)
track_gradients_dists(model, aim_run)
```

The experiments tracked by Aim are stored in the `.aim` folder. **To display the logs with the Aim UI in your Space, you need to compress the `.aim` folder to a `tar.gz` file and upload it to your Space using `git` or the Files and Versions sections of your Space.**

Here's a bash command for that:

```bash
tar -czvf aim_repo.tar.gz .aim
```

That’s it! Now open the App section of your Space and the Aim UI is available with your logs.
Here is what to expect:

![Aim UI on HF Hub Spaces](https://user-images.githubusercontent.com/23078323/232034340-0ba3ebbf-0374-4b14-ba80-1d36162fc994.png)

Filter your runs using Aim’s Pythonic search. You can write pythonic [queries against](https://aimstack.readthedocs.io/en/latest/using/search.html) EVERYTHING you have tracked - metrics, hyperparams etc. Check out some [examples](https://huggingface.co/aimstack) on HF Hub Spaces.
