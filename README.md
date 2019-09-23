# Aim

Aim is an AI deployment and version control system.
It can handle both small and large projects through their whole life cycle with efficiency and speed.
It is built to seamlessly blend in with existing ML stack and become an integral part of the development lifecycle.

## Aim CLI
Aim CLI is a command line tool for building end-to-end AI.
Aim is built to be:
compatible with the existing ecosystem of tools
be familiar
just work
make building AI productive

Aim has three main features: tracking of training, export and deploy.

### Tracking - ML Training
Command: `aim train`
Aim train runs training for the given aim repository. Aim train tracks the gradients and updates in the model with given interval and saves them for visualization and analysis.
Aim Train is paired with UI that visualizes the artifacts tracked.
Aim Tracking is used to debug and have a detailed understanding of the process of training.

### Export - ML Model
Command: `aim export`
Aim export creates the saved model checkpoint file and exports .aim model which could be committed and pushed to the Aimhub and/or deployed to different platforms.
Exported .aim model could also be converted to .onnx, .tf and other checkpoints for other frameworks.
Aim CLI Export is based on aim Intermediate Representation that allows for automatic deployment of the model.
Aim Export can also export pre-processing steps similarly to the model and could be included in the model deployment process.

### Deploy - Aim Model
Command: `aim deploy`
Aim Deploy produces a deployable artifact from .aim (model and preprocessing) files. The produced artifacts can run in cloud, on different hardware and as a hybrid.
Deployments are also reflected on Aimhub to track and version the deployed artifacts.


### Other Commands

```shell
aim fork
aim branch off
aim pause, continue
aim convert
```


