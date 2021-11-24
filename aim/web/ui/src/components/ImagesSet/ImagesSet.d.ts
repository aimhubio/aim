export interface IImageSetProps {
  data: any;
  orderedMap: { [key: string]: any };
  imagesBlobs: object;
  onScroll: () => void;
  addUriToList: (blobUrl: string) => void;
  index?: number;
  imagesSetKey: number;
  imageSetWrapperHeight?: number;
  imageSetWrapperWidth?: number;
  imageHeight: number;
}
