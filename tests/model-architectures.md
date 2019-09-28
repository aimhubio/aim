# Computer Vision: Tasks, Datasets and Architectures 

### Types of CV tasks:
 - Object Recognition / Classification
 - Classification + Localisation
 - Object Detection
 - Image Segmentation
 
**Object Recognition / Classification** – In object recognition, you are given a raw image and your task is to identify which class does the image belong to.

**Classification + Localisation** – If there is only one object in the image, and your task is to find the location of that object, a more specific term given to this problem is localisation problem.

**Object Detection** – In object detection, you task is to identify where in the image does the objects lies in. These objects might be of the same class or different class altogether.

**Image Segmentation** – Image Segmentation is a bit sophisticated task, where the objective is to map each pixel to its rightful class.

### Major CV Architectures:
- AlexNet (2012)
- GoogLeNet/Inception (2014)
- R-CNN (2014)
- [VGG Net](https://arxiv.org/pdf/1409.1556.pdf) (2014)
- [ResNet](https://arxiv.org/pdf/1512.03385.pdf) (2015)
- [Inception-v3,4](https://arxiv.org/pdf/1602.07261.pdf) (2015-2016)
- [ResNeXt](https://arxiv.org/pdf/1611.05431.pdf) (2017)
- [Mask R-CNN](https://arxiv.org/pdf/1703.06870.pdf) (2018)
- [YOLO v3](https://pjreddie.com/media/files/papers/YOLOv3.pdf)  (2018)

![CV Architectures Comparison](https://i.imgur.com/9yQwrmb.png "CV Architectures Comparison")
![CV Architectures Comparison](https://i.imgur.com/wlFccpY.png "CV Architectures Comparison")

### Open Datasets for CV
- [CIFAR-10](https://www.cs.toronto.edu/~kriz/cifar.html): Consists of 60,000 32×32 colour images in 10 classes, with 6,000 images per class
- [CIFAR-100](https://www.cs.toronto.edu/~kriz/cifar.html): Just like the CIFAR-10, except it it has 100 classes containing 600 images each
- **Cityscapes**: Contains a diverse set of stereo video sequences recorded in street scenes from 50 different cities. Includes high-quality pixel-level annotations of 5,000 frames in addition to a larger set of 20,000 weakly annotated frames
- **ImageNet**: Offers tens of millions of cleanly sorted images for most of the concepts in the WordNet hierarchy
- **COCO**: Large-scale object detection, segmentation, and captioning dataset containing over 200,000 labeled images
- **IMDB-Wiki Dataset**: 460K + 63K images face images with gender and age labels

## References:
 - [https://arxiv.org/pdf/1901.06032.pdf](https://arxiv.org/pdf/1901.06032.pdf)
 - [https://medium.com/alumnaiacademy/introduction-to-computer-vision-4fc2a2ba9dc](https://medium.com/alumnaiacademy/introduction-to-computer-vision-4fc2a2ba9dc)
 - [https://pjreddie.com/darknet/yolo/](https://pjreddie.com/darknet/yolo/)