import { FormatEnum } from 'components/ExportPreview/config';

function imgSource2Image({
  imgSrc,
  width,
  height,
  format = FormatEnum.JPEG,
  callback,
}: {
  imgSrc: string;
  width: number;
  height: number;
  format: Omit<FormatEnum, 'SVG'>;
  callback: (src: string) => void;
}) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  let image = new Image();
  image.onload = function () {
    if (context) {
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && callback) {
            callback(URL.createObjectURL(blob));
          }
        },
        'image/' + format,
        1,
      );
    }
  };
  image.src = imgSrc;
}

export default imgSource2Image;
