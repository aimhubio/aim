import { IPreviewBounds } from './ExportPreview.d';

const previewBounds: IPreviewBounds = {
  max: {
    width: 2000,
    height: 2000,
  },
  min: {
    width: 220,
    height: 220,
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
