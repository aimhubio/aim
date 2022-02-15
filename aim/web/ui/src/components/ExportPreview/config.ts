import { IPreviewBounds } from './ExportPreview.d';

const previewBounds: IPreviewBounds = {
  max: {
    width: 4000,
    height: 2000,
  },
  min: {
    width: 200,
    height: 110,
  },
};

const previewModalDimension = {
  width: 976,
  height: 506,
};

enum FormatEnum {
  SVG = 'svg',
  JPEG = 'jpeg',
  PNG = 'png',
}

export { previewBounds, previewModalDimension, FormatEnum };
