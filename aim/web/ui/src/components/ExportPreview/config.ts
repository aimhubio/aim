import { IPreviewBounds } from './ExportPreview.d';

const PREVIEW_BOUNDS: IPreviewBounds = {
  max: {
    width: 4000,
    height: 2000,
  },
  min: {
    width: 200,
    height: 110,
  },
};

const PREVIEW_MODAL_DIMENSION = {
  width: 976,
  height: 506,
};

enum FormatEnum {
  SVG = 'svg',
  JPEG = 'jpeg',
  PNG = 'png',
}

export { PREVIEW_BOUNDS, PREVIEW_MODAL_DIMENSION, FormatEnum };
