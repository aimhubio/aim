import { FORMAT_ENUM } from 'components/ExportPreview/config';
/**
 * [Convert image source to the image by specifying format and dimension]
 *
 * Usage: imgSource2Image({ imgSrc, width, height, format, callback })
 *
 * @param {string} imgSrc valid html image source,
 * @param {number} width width of the converted image,
 * @param {number} height height of the converted image,
 * @param {FORMAT_ENUM} format of the converted image,
 * @param {(blob: Blob) => void;} callback of the image conversion,
 * @returns {void}
 */
function imgSource2Image({
  imgSrc,
  width,
  height,
  format = FORMAT_ENUM.JPEG,
  callback,
}: {
  imgSrc: string;
  width: number;
  height: number;
  format: Omit<FORMAT_ENUM, 'SVG'>;
  callback: (blob: Blob) => void;
}): void {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (canvas && context) {
    canvas.width = width;
    canvas.height = height;
    const image = new Image();
    image.onload = function () {
      if (context) {
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && callback) {
              callback(blob);
            }
          },
          'image/' + format,
          1,
        );
      }
    };
    image.src = imgSrc;
  }
}

export default imgSource2Image;
