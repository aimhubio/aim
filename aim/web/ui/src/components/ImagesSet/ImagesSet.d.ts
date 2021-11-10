export interface IImageSetProps {
  data: any;
  title: string;
  imagesBlobs: object;
  onScroll: (e?: any) => void;
  addUriToList: (blobUrl: string) => void;
  index?: number;
  imagesSetWrapper?: MutableRefObject<any>;
  imagesSetKey: number;
}
