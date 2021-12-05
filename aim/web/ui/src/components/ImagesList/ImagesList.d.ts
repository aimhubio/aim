import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IImagesListProps {
  data: IImageData[];
  onScroll: () => void;
  imagesBoxRef: MutableRefObject<any>;
  addUriToList: (blobUrl: string) => void;
}

export interface IImageBoxProps {
  data: IImageData[];
  addUriToList: (blobUrl: string) => void;
  index: number;
  style: object;
}
