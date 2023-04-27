# You should download and extract the data beforehand. Simply by doing this:
# wget https://github.com/AnelMusic/Arabic_MNIST_Character_Classification/blob/master/arabic_mnist_dataset.tar.gz?raw=true
# tar -xzf 'arabic_mnist_dataset.tar.gz?raw=true'

from fastai.vision.all import DataBlock, ImageBlock, CategoryBlock, accuracy
from fastai.vision.all import GrandparentSplitter, Resize, Normalize
from fastai.vision.all import get_image_files, aug_transforms, imagenet_stats
from fastai.vision.all import cnn_learner, resnet18, CrossEntropyLossFlat
import regex as re
from aim.fastai import AimCallback


def get_arabic_mnist_labels(file_path):
    regex = 'label_(.+).png'
    label = re.search(regex, str(file_path)).group(1)
    return arabic_mnist_labels[int(label) - 1]


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
regex = 'label_(.+).png'
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
dls = arab_mnist.dataloaders('.')
learn = cnn_learner(
    dls,
    resnet18,
    pretrained=True,
    loss_func=CrossEntropyLossFlat(),
    metrics=accuracy,
    model_dir='/tmp/model/',
    cbs=AimCallback(repo='.', experiment_name='fastai_test'),
)
learn.fit_one_cycle(1, lr_max=slice(10e-6, 1e-4))
