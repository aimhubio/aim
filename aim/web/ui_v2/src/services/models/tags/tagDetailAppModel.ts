import tagsService from 'services/api/tags/tagsService';
import { ITagProps } from 'types/pages/tags/Tags';
import createModel from '../model';

const model = createModel<Partial<any>>({
  isRunsDataLoading: false,
  isTagInfoDataLoading: false,
});

function initialize() {
  model.init();
}

let getTagRunsRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

let getTagByIdRequestRef: {
  call: () => Promise<any>;
  abort: () => void;
};

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
    });
}

function updateTagInfo(tagInfo: ITagProps) {
  const state = model.getState();
  model.setState({
    ...state,
    tagInfo,
  });
}

const tagsDetailAppModel = {
  ...model,
  initialize,
  getTagRuns,
  archiveTag,
  getTagById,
  updateTagInfo,
};

export default tagsDetailAppModel;
