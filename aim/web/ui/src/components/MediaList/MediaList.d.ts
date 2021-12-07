import { MutableRefObject } from 'react';

import { IImageData } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface IMediaListProps {
  data: IImageData[];
  onScroll: () => void;
  mediaItemsListRef: MutableRefObject<any>;
  addUriToList: (blobUrl: string) => void;
}

export interface IImageBoxProps {
  data: IImageData[];
  addUriToList: (blobUrl: string) => void;
  index: number;
  style: object;
}
