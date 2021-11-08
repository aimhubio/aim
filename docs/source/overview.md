# Overview
<div align="center">

<img src="https://user-images.githubusercontent.com/13848158/136364717-0939222c-55b6-44f0-ad32-d9ab749546e4.png" height="70" />
<br />
<br />
<h4>
Aim package logs your training runs, enables a beautiful UI to compare them and an API to query them programmatically.
</h4>
</div>

## Why use Aim?

- Modern ML development revolves around collection and analysis of AI metadata (training metrics, images, distributions etc) to analyze and explore different aspects of the model performance.

- There is both a need to manually explore and compare the metadata as well as automate for different infrastructure needs.

- Aim helps to track AI metadata and
  - Explore it manually through the most advanced open-source experiment comparison web UI.
  - Query programmatically in your favorite notebook or through script for automation.

- Use Aim to seamlessly log your ML metadata in your training environment and explore through UI and code. Aim is free, open-source and self-hosted.

## What can you do with Aim?

### Log metrics and params

Use the Aim SDK to log as many metrics and params as you need for your training and evaluation runs.
Aim users track 1000s of training runs and sometimes more than 100s of metrics per run with los of steps.


### Query metadata on Web UI
Aim enables a powerful pythonic query language to filter through metadata.
It's like a python if statement over everything you have tracked. You can use this on all explorer screens.



### Runs explorer
Runs explorer will help you to hollistically view all your runs, each metric last tracked values and tracked hyperparameters.

### Metrics explorer
Metrics explorer helps you to compare 100s of metrics within a few clicks.
It helps to save lots of time compared to other open-source experiment tracking tools.

### Params explorer
Params explorer enables a parallel coordinates view for metrics and params. Very helpful when doing hyperparameter search.

### Images explorer (coming soon...)
Track intermediate images and search, compare them on the Images Explorer.

### Query metadata programmatically
Use the same pythonic if statement to query the data through the Aim SDK programmatically.


## How Aim works?
Aim is a python package with three main components:
- Aim Storage
  - A rocksdb-based embedded storage where the metadata is stored locally
- Aim SDK
  - A simple python interface that allows to track AI metadata
    - metrics
    - hyperparameters
    - images
- Aim UI
  - A self-hosted web interface to deeply explore the tracked metadata

Aim SDK is the primary backend of the Aim UI.
Aim SDK enables an API to programmatically query the logged metadata.



<div align="center">
<h6 style="color: grey">Integrate seamlessly with your favorite tools</h6>

<img src="https://user-images.githubusercontent.com/13848158/96861310-f7239c00-1474-11eb-82a4-4fa6eb2c6bb1.jpg" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/96859323-6ba90b80-1472-11eb-9a6e-c60a90f11396.jpg" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/96861315-f854c900-1474-11eb-8e9d-c7a07cda8445.jpg" width="100" />

<br />

<img src="https://user-images.githubusercontent.com/13848158/97086626-8b3c6180-1635-11eb-9e90-f215b898e298.png" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/112145238-8cc58200-8bf3-11eb-8d22-bbdb8809f2aa.png" width="100" />
<img src="https://user-images.githubusercontent.com/13848158/118172152-17c93880-b43d-11eb-9169-785e4b52d89c.png" width="100" />

</div>

<br />

Aim is open-source, self-hosted AI experiment tracking tool. Use Aim to deeply inspect hundreds of hyperparameter-sensitive training runs at once.

<h3 align="center">
Try out Aim at <a href="http://play.aimstack.io:10001/metrics?grouping=2KhRameHik98oBj8Bsw6VRdcA7KuW5Y2kZtNEFLDLRtdSb1RVR7k9p9QkRk9Tvai2qWdRFPzisMBiA5RNazdhRaE56LwugevHBFTsESJULie39yCghtVnq5CuWSA2B8MuPn3Dg6XRqVrsC7BpJE16jRKnZ7dZ7xonbkXiAM2TPL3YRByWYrre6J3hUPB7BdfUJz57sdPjnF3G72SbQUGEWXKZQKHNyQCjEkPbKNxQUKxh7wXeMB3PF1gqjGtGSEihL5LsT7jmnPBr5Mfr4dHp2mbUGSt8cQNydQhC1iPW53jXnZ77TdSnoHjGT1xLuSTyUzhLBpaPPMokZPV7cmi2FybEGWmVd53athLrBmuVx8PffZCpUoXUDbwZS4fzrgp9HBZhsfUunmJzqADxg3SxYny4k2dLoVer3ULiBzXExPkXaNsRaiJbM8ZTXsPVfVZbgCR1zyBHSogayxSZBdqdVD8rY5K&chart=Cm6b4V1xjN1vWwfnKhWBAJ491MNYk6oJHwWJtyKVe6zu6D7ShYbPyEyVuVgyn73j7KNbhSnhLnU6evCrpnHa338r8cXeEYtgUoNhxxBbYuVdUXqAox1334Uzc59hFxtbDfeL2MtZVh2JoLqiyEjnSqeqX6FWbWKAF61ivoFdkutMnDyhKCT9SoZYgLr9y1wR8CssfX2rwN4JUWT8k2Jr84WJ1vpAhrcB3xERKF3rAddQsczC1wE7824Qk3WVKAttLTLG5FVidFh9XkTD4Sdzf7DZ1DYoqiHs9zBFM2LASd7rz42fkmmrrz7koHoFQG6787QLuGBRDZTvYvCT8JeLbXpTdLtKXbvU3dboKqdbv7u9FvsCc7ir1SQeignKE7EKihcFSXf97QKLNXxNPdeyiwdGuj8Cj4kHfYwqRGUcjxMSihV45Y7F3x2W8zUvKB6uJLEnpDAufhcN7mLbzrjNRQ5mfW2GfgoJ5a6nrhzcUMbkztokkKpgokm2tZ23XWfyEq6WMxRxdXCrBMeuE5EgbfeResip87GcxW5o784gfG8xRaGdS596sQhLfgT4FPzytUqyHXU4upwfb65jGrUzG1dsiaiB1rZyXKpw6riKLCNNvRXVTnzRenQpyHzJBqDccyMSehy8T4ThFSjniSvsk1jKbsVgq2rA3RMyLJf9Z85cpx3hx7RmrJTCNv2aZtb3xXH3bEBms9u2XVCrykVsrSSRP4Tv3vjsbuMDdpAy5RscUCqPgFhJdHzTEaZGTzVL214rRWNum5RBgpcdK3QGtVWwAPXV2jirEpoUhqFEv4gTKX3KXL6LUPsi7jYPGNbMWAcovt3fTgVCrWZeaHRcSG3WKJX5La2vkjnDmhHNs4SbDjS6ze31iaz2fCwzSZ9v3ca4pVtWezPbHpBZVpZd4FG4Lt3oKDG2xvKP9w1Q1jP77hM4eozJxTFiTgQxH4S8mpnfYbxrnmVwxhAu4PKRmevEZkJPVX1hMN6yykqFz7RrhvG4yQ8muYEYWv5DkzycptNy9bDEmDxVAk2CRnvbdo6jYnWbh77t1JEZdhJoCaVSHk6MovrdLoc5X8jxEbcDU7xBL3wj5ecULt3tYq5aoFeNHHCTBxWnk2gA5iLZNA7rBNtQuEzBpN1kjh&select=7zY8Ghyd8kPXab3LdBmLqMwxSSWcZypz9sHYtcG8bSoniZPTnXp2oTf9TrxEu55XfP546wpJrzzEXCGpczGdS9z8coMktqf7j2EbUveJeLRBSPBPw83ru5MxhMSA3FysZ5nTiroEqNktj2ux67ExzjkheiJhWkf5oJNrKYEPuM8adYhjBH2Ez5Ma1uiNZfQxu1mt18iqX3DcFAc3BjjH3WXE3guqpk4bFzk16JB8Nz4pvhsuBDH6XUuGQsZEzoKRbbELYVMozcABWWn47w35XcT9YE4Bmyk8vuJuCY7wmN5wHxt8BiNAGoh9UQGcRqrWV55swMGy3v3Yfkfo9YSDZCEbs47gJ7kAbfLEGe4EPr2yv9h3mu5NuScU5fajDiGrt4oREeBK1SH3EqnPS8qznn4cumJccEBsPGzc88vQY3rHvyzD5LTrnmPxDUARm9HYeLq61nUJPjpUErEPwV37wiYzZrE8o3j8oVm4cwo1fczfffXjG7NkmqSVheZ">play.aimstack.io</a>
<br />
Join the Aim community on <a href="https://slack.aimstack.io">Slack</a>
</h3>

<br />

<img style="border: 1px solid" src="https://user-images.githubusercontent.com/13848158/136374529-af267918-5dc6-4a4e-8ed2-f6333a332f96.gif" />
