import emptyBookmarks from 'assets/illustrations/emptyBookmarks.svg';
import emptySearch from 'assets/illustrations/emptySearch.svg';
import exploreData from 'assets/illustrations/exploreData.svg';
import wrongSearch from 'assets/illustrations/wrongSearch.svg';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';

enum IllustrationsEnum {
  EmptyBookmarks = 'emptyBookmarks',
  EmptySearch = 'emptySearch',
  ExploreData = 'exploreData',
  WrongSearch = 'wrongSearch',
  EmptyData = 'emptyData',
}

const Illustrations_List: { [key: string]: string } = {
  [IllustrationsEnum.EmptyBookmarks]: emptyBookmarks,
  [IllustrationsEnum.EmptySearch]: emptySearch,
  [IllustrationsEnum.ExploreData]: exploreData,
  [IllustrationsEnum.WrongSearch]: wrongSearch,
};

const Request_Illustrations = {
  [RequestStatusEnum.BadRequest]: IllustrationsEnum.WrongSearch,
  [RequestStatusEnum.NotRequested]: IllustrationsEnum.ExploreData,
  [RequestStatusEnum.Ok]: IllustrationsEnum.ExploreData,
  [RequestStatusEnum.Pending]: IllustrationsEnum.ExploreData,
};

const Illustration_Content_Config: { [key: string]: object | any } = {
  runs: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptyData]: '',
  },
  metrics: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'Empty Search',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: 'message code snippet',
  },
  params: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'Empty Search',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: 'message code snippet',
  },
  images: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'Empty Search',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: 'message code snippet',
  },
  scatters: {
    [IllustrationsEnum.WrongSearch]: 'Wrong Search',
    [IllustrationsEnum.EmptySearch]: 'Empty Search',
    [IllustrationsEnum.ExploreData]: 'Explore Data',
    [IllustrationsEnum.EmptyData]: 'message code snippet',
  },
  bookmarks: {
    [IllustrationsEnum.ExploreData]: 'Explore Data',
  },
  tags: {},
};

export {
  IllustrationsEnum,
  Illustrations_List,
  Illustration_Content_Config,
  Request_Illustrations,
};
