import { IPreviewBounds } from './ExportPreview.d';

const previewBounds: IPreviewBounds = {
  max: {
    width: 2000,
    height: 2000,
  },
  min: {
    width: 340,
    height: 100,
  },
};

const defaultPreviewBounds = {
  width: 1024,
  height: 300,
};

export { previewBounds, defaultPreviewBounds };
