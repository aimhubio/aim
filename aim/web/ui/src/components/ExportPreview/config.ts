import { IPreviewBounds } from './ExportPreview.d';

const PREVIEW_BOUNDS: IPreviewBounds = {
  max: {
    width: 4000,
    height: 2000,
  },
  min: {
    width: 200,
    height: 150,
  },
};

const PREVIEW_MODAL_DIMENSION = {
  width: 1366,
  height: 540,
};

enum FORMAT_ENUM {
  SVG = 'svg',
  JPEG = 'jpeg',
  PNG = 'png',
}

export { PREVIEW_BOUNDS, PREVIEW_MODAL_DIMENSION, FORMAT_ENUM };
