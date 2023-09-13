# You should download and extract the data beforehand. Simply by doing this:
# wget -c https://github.com/AnelMusic/Arabic_MNIST_Character_Classification/blob/master/arabic_mnist_dataset.tar.gz?raw=true -O arabic_mnist_dataset.tar.gz
# mkdir -p arabic_mnist_dataset && tar -xzf arabic_mnist_dataset.tar.gz -C arabic_mnist_dataset

import regex as re
from aimstack.ml.integrations.fastai import AimCallback
from fastai.vision.all import (CategoryBlock, CrossEntropyLossFlat, DataBlock,
                               GrandparentSplitter, ImageBlock, Normalize,
                               Resize, accuracy, aug_transforms, cnn_learner,
                               get_image_files, imagenet_stats, resnet18)


def get_arabic_mnist_labels(file_path):
    regex = "label_(.+).png"
    label = re.search(regex, str(file_path)).group(1)
    return arabic_mnist_labels[int(label) - 1]


arabic_mnist_labels = [
    "alef",
    "beh",
    "teh",
    "theh",
    "jeem",
    "hah",
    "khah",
    "dal",
    "thal",
    "reh",
    "zain",
    "seen",
    "sheen",
    "sad",
    "dad",
    "tah",
    "zah",
    "ain",
    "ghain",
    "feh",
    "qaf",
    "kaf",
    "lam",
    "meem",
    "noon",
    "heh",
    "waw",
    "yeh",
]
regex = "label_(.+).png"
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
# source
dls = arab_mnist.dataloaders("arabic_mnist_dataset")
learn = cnn_learner(
    dls,
    resnet18,
    pretrained=True,
    loss_func=CrossEntropyLossFlat(),
    metrics=accuracy,
    model_dir="/tmp/model/",
    cbs=AimCallback(experiment_name="fastai_test"),
)
learn.fit_one_cycle(1, lr_max=slice(10e-6, 1e-4))
