import tagsService from 'services/api/tags/tagsService';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum } from 'utils/d3';
import createModel from '../model';

const model = createModel<Partial<any>>({});

function initialize() {
  model.init();
}

function getTagsData() {
  const { call, abort } = tagsService.getTags();

  return {
    call: () =>
      call().then((data: any) => {
        model.setState({ tagsList: data });
      }),
    abort,
  };
}

const metricAppModel = {
  ...model,
  initialize,
  getTagsData,
};

export default metricAppModel;
