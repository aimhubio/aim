import logging
import os

import regex as re

from aim.fastai import AimCallback
from fastai.vision.all import (
    CategoryBlock,
    CrossEntropyLossFlat,
    DataBlock,
    GrandparentSplitter,
    ImageBlock,
    Normalize,
    Resize,
    accuracy,
    aug_transforms,
    cnn_learner,
    get_image_files,
    imagenet_stats,
    resnet18,
)


def get_arabic_mnist_labels(file_path):
    regex = 'label_(.+).png'
    label = re.search(regex, str(file_path)).group(1)
    return arabic_mnist_labels[int(label) - 1]


def download_arabic_mnist():
    url = 'https://github.com/AnelMusic/Arabic_MNIST_Character_Classification/blob/master/arabic_mnist_dataset.tar.gz?raw=true'
    output_zip_file = 'arabic_mnist_dataset.tar.gz'
    output_dir = 'arabic_mnist_dataset'

    try:
        os.system(f'wget -c {url} -O {output_zip_file}')
    except Exception as e:
        logging.info(f'Failed to download the dataset: {e}')
    try:
        os.system(f'mkdir -p {output_dir} && tar -xzf {output_zip_file} -C {output_dir}')
    except Exception as e:
        logging.info(f'failed to unzip the dataset file: {e}')

    return output_dir


arabic_mnist_labels = [
    'alef',
    'beh',
    'teh',
    'theh',
    'jeem',
    'hah',
    'khah',
    'dal',
    'thal',
    'reh',
    'zain',
    'seen',
    'sheen',
    'sad',
    'dad',
    'tah',
    'zah',
    'ain',
    'ghain',
    'feh',
    'qaf',
    'kaf',
    'lam',
    'meem',
    'noon',
    'heh',
    'waw',
    'yeh',
]

arab_mnist = DataBlock(
    blocks=(ImageBlock, CategoryBlock),
    get_items=get_image_files,
    splitter=GrandparentSplitter(),
    get_y=get_arabic_mnist_labels,
    item_tfms=Resize(460),
    batch_tfms=[
        *aug_transforms(do_flip=False, size=224, min_scale=0.85),
        Normalize.from_stats(*imagenet_stats),
    ],
)

dataset_dir = download_arabic_mnist()

# source
dls = arab_mnist.dataloaders(dataset_dir)


learn = cnn_learner(
    dls,
    resnet18,
    pretrained=True,
    loss_func=CrossEntropyLossFlat(),
    metrics=accuracy,
    model_dir='/tmp/model/',
    cbs=AimCallback(experiment_name='example_experiment'),
)

learn.fit_one_cycle(1, lr_max=slice(10e-6, 1e-4))
