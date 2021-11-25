import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IImagesListProps {
  data: IImageData[];
  imagesBlobs: object;
  onScroll: () => void;
  imagesBoxRef: MutableRefObject<any>;
  addUriToList: (blobUrl: string) => void;
}

export interface IImageBoxProps {
  data: IImageData[];
  imagesBlobs: object;
  addUriToList: (blobUrl: string) => void;
  index: number;
  style: object;
}
