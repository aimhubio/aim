import tagsService from 'services/api/tags/tagsService';
import createModel from '../model';

const model = createModel<Partial<any>>({});

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
    getTagByIdRequestRef.abort();
  }
  getTagByIdRequestRef = tagsService.getTagById(id);

  return {
    call: async () => {
      const data = await getTagByIdRequestRef.call();
      model.setState({ tagInfo: data });
    },
    abort: getTagRunsRequestRef.abort,
  };
}

function getTagRuns(id: string) {
  if (getTagRunsRequestRef) {
    getTagRunsRequestRef.abort();
  }
  getTagRunsRequestRef = tagsService.getTagRuns(id);

  return {
    call: async () => {
      const data = await getTagRunsRequestRef.call();
      model.setState({ tagRuns: data.runs });
    },
    abort: getTagRunsRequestRef.abort,
  };
}

function archiveTag(id: string, archived: boolean = false) {
  const state = model.getState();
  tagsService
    .hideTag(id, archived)
    .call()
    .then(() => {
      model.setState({
        ...state,
        tagInfo: { ...state?.tagInfo, archived },
      });
    });
}

const tagsDetailAppModel = {
  ...model,
  initialize,
  getTagRuns,
  archiveTag,
  getTagById,
};

export default tagsDetailAppModel;
