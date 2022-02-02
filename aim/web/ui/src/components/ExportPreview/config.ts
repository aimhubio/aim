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

const defaultPreviewBounds = {
  width: 1024,
  height: 640,
};

export { previewBounds, defaultPreviewBounds };
