export interface IImageSetProps {
  data: any;
  title: string;
  imagesBlobs: object;
  onScroll: () => void;
  addUriToList: (blobUrl: string) => void;
  index?: number;
  imagesSetWrapper?: MutableRefObject<any>;
}
