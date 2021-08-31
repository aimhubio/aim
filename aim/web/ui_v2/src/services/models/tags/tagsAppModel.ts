import tagsService from 'services/api/tags/tagsService';
import createModel from '../model';

const model = createModel<any>({ isTagsDataLoading: false });

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

const tagsAppModel = {
  ...model,
  initialize,
  getTagsData,
};

export default tagsAppModel;
