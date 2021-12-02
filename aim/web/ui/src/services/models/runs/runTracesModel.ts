import createModel from 'services/models/model';
import runsService from 'services/api/runs/runsService';

import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

import {
  TraceType,
  IRunTraceModel,
  TraceRawDataItem,
  TraceResponseData,
} from './types';
import {
  getContextObjFromMenuActiveKey,
  processDistributionsData,
  processImagesData,
  getMenuData,
} from './util';

const dataProcessors = {
  distributions: processDistributionsData,
  images: processImagesData,
};

// @TODO implement type
let getTraceBatchRequestRef: any = null;

const model = createModel<Partial<IRunTraceModel>>({});

function initialize(
  run_id: string,
  traceType: TraceType,
  traces: TraceRawDataItem[],
) {
  model.init();

  const { data, availableIds, title, defaultActiveKey, defaultActiveName } =
    getMenuData(traceType, traces);
  // setMenuData
  model.setState({
    runHash: run_id,
    traceType,
    isTraceBatchLoading: true,
    menu: {
      title,
      items: data,
      defaultActiveItemKey: defaultActiveKey,
      activeItemKey: defaultActiveKey,
      availableKeys: availableIds,
      activeItemName: defaultActiveName,
    },
    batchRequestOptions: {
      trace: getContextObjFromMenuActiveKey(defaultActiveKey, availableIds),
      query: null,
    },
  });
}

function changeActiveItemKey(key: string, name: string) {
  const state = model.getState();
  const menuState = state.menu;
  const batchRequestOptions = state.batchRequestOptions;

  const batchRequestTrace = getContextObjFromMenuActiveKey(
    key || '',
    menuState?.availableKeys || [],
  );

  model.setState({
    ...state,
    menu: {
      ...menuState,
      activeItemKey: key,
      activeItemName: name,
    },
    batchRequestOptions: {
      ...batchRequestOptions,
      trace: batchRequestTrace,
    },
  });

  getRunTraceBatch().then().catch();
}

function abortGetTraceBatchBatchRequest() {
  if (getTraceBatchRequestRef) {
    getTraceBatchRequestRef?.abort();
    getTraceBatchRequestRef = null;
  }
}

async function getRunTraceBatch() {
  abortGetTraceBatchBatchRequest();

  const state = model.getState();
  const requestOptions = state.batchRequestOptions;
  getTraceBatchRequestRef = runsService.getBatch(
    state.runHash || '',
    state.traceType || 'distributions',
    {},
    [requestOptions?.trace],
  );

  try {
    model.setState({
      ...state,
      isTraceBatchLoading: true,
    });
    const stream = await getTraceBatchRequestRef?.call((detail: any) => {
      // @TODO add exception
      console.error(detail);
    });

    let gen = adjustable_reader(stream);
    let buffer_pairs = decode_buffer_pairs(gen);
    let decodedPairs = decodePathsVals(buffer_pairs);
    let objects = iterFoldTree(decodedPairs, 1);

    let data: Partial<TraceResponseData> = {};
    for await (let [keys, val] of objects) {
      data = {
        ...data,
        [keys[0]]: val,
      };
    }
    const parsed = dataProcessors[state.traceType || 'distributions'](data);
    model.setState({
      ...state,
      data: parsed,
      isTraceBatchLoading: false,
    });
  } catch (e) {
    // @TODO handle exception
    throw e;
  }
}

function destroy() {
  model.destroy();
  abortGetTraceBatchBatchRequest();
}

export default {
  ...model,
  destroy,
  initialize,
  changeActiveItemKey,
};
