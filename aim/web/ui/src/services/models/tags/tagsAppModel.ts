import tagsService from 'services/api/tags/tagsService';
import * as analytics from 'services/analytics';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { ITagProps } from 'types/pages/tags/Tags';

import createModel from '../model';

const model = createModel<any>({
  isTagsDataLoading: false,
  isRunsDataLoading: false,
  isTagInfoDataLoading: false,
  notifyData: [],
});

function initialize() {
  model.init();
}

function getTagsData() {
  const { call, abort } = tagsService.getTags();

  return {
    call: () => {
      model.setState({ isTagsDataLoading: true });
      call().then((data: any) => {
        model.setState({ tagsList: data, isTagsDataLoading: false });
      });
    },
    abort,
  };
}

let getTagRunsRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

let getTagByIdRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

function onNotificationDelete(id: number) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}

function onNotificationAdd(notification: INotification) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id);
  }, 3000);
}

function getTagById(id: string) {
  if (getTagByIdRequestRef) {
    getTagByIdRequestRef?.abort();
  }
  getTagByIdRequestRef = tagsService.getTagById(id);

  return {
    call: async () => {
      model.setState({ isTagInfoDataLoading: true });

      const data = await getTagByIdRequestRef.call();
      model.setState({ tagInfo: data, isTagInfoDataLoading: false });
    },
    abort: getTagByIdRequestRef?.abort,
  };
}

function getTagRuns(id: string) {
  if (getTagRunsRequestRef) {
    getTagRunsRequestRef?.abort();
  }
  getTagRunsRequestRef = tagsService.getTagRuns(id);

  return {
    call: async () => {
      model.setState({ isRunsDataLoading: true });
      const data = await getTagRunsRequestRef.call();
      model.setState({ tagRuns: data.runs, isRunsDataLoading: false });
    },
    abort: getTagRunsRequestRef?.abort,
  };
}

function archiveTag(id: string, archived: boolean = false) {
  const state = model.getState();
  return tagsService
    .hideTag(id, archived)
    .call()
    .then(() => {
      model.setState({
        ...state,
        tagInfo: { ...state?.tagInfo, archived },
      });
      onNotificationAdd({
        id: Date.now(),
        severity: 'success',
        message: archived
          ? 'Tag successfully archived'
          : 'Tag successfully unarchived',
      });
      analytics.trackEvent(
        archived ? '[Tags] Archive Tag' : '[Tags] Unarchive Tag',
      );
    });
}

function createTag(body: object) {
  return tagsService
    .createTag(body)
    .call()
    .then((res: any) => {
      if (res.id) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'success',
          message: 'Tag successfully created',
        });
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: res.detail,
        });
      }
      analytics.trackEvent('[Tags] Create Tag');
      return res;
    });
}

function updateTag(body: object, id: string) {
  return tagsService
    .updateTag(body, id)
    .call()
    .then((res: any) => {
      if (res.id) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'success',
          message: 'Tag successfully updated',
        });
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: res.detail,
        });
      }
      analytics.trackEvent('[Tags] Update Tag');
      return res;
    });
}

function deleteTag(id: string) {
  return tagsService
    .deleteTag(id)
    .call()
    .then(() => {
      onNotificationAdd({
        id: Date.now(),
        severity: 'success',
        message: 'Tag successfully deleted',
      });
      analytics.trackEvent('[Tags] Delete Tag');
    });
}

function updateTagInfo(tagInfo: ITagProps) {
  const state = model.getState();
  model.setState({
    ...state,
    tagInfo,
  });
}

const tagsAppModel = {
  ...model,
  initialize,
  getTagsData,
  getTagRuns,
  archiveTag,
  getTagById,
  updateTagInfo,
  onNotificationDelete,
  deleteTag,
  createTag,
  updateTag,
};

export default tagsAppModel;
