import createModel from 'services/models/model';
import runsService from 'services/api/runs/runsService';

import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

import settings from './settings';
import {
  TraceResponseData,
  TraceRawDataItem,
  IRunTraceModel,
  RangePanelItem,
  TraceType,
  QueryData,
  IConfig,
} from './types';
import {
  getContextObjFromMenuActiveKey,
  getMenuData,
  reformatArrayQueries,
} from './util';

// @TODO implement type
let getTraceBatchRequestRef: any = null;

const model = createModel<Partial<IRunTraceModel>>({});

function getDefaultQueryAndConfigData(traceType: TraceType) {
  const traceSettings = settings[traceType];
  const queryData: QueryData = {
    sliders: {},
    inputs: {},
  };
  const config: IConfig = {
    rangePanel: [],
  };

  const inputKeys = Object.keys(traceSettings.inputs);

  Object.keys(traceSettings.sliders).forEach((key, index) => {
    const item = traceSettings.sliders[key];
    queryData.sliders[key] = item.defaultValue;
    const correspondedInput = traceSettings.inputs[inputKeys[index]];

    // inject range panel data
    const processedItem: RangePanelItem = {
      sliderName: key,
      inputName: inputKeys[index],
      sliderTitle: item.title,
      inputTitle: correspondedInput.title,
      sliderTitleTooltip: item.tooltip,
      inputTitleTooltip: correspondedInput.tooltip,
      sliderType: item.sliderType,
    };

    config.rangePanel.push(processedItem);
  });

  Object.keys(traceSettings.inputs).forEach((key) => {
    queryData.inputs[key] = traceSettings.inputs[key].defaultValue;
  });

  return { queryData, config };
}

function initialize(
  run_id: string,
  traceType: TraceType,
  traces: TraceRawDataItem[],
  runParams?: object,
) {
  model.init();

  const { data, availableIds, title, defaultActiveKey, defaultActiveName } =
    getMenuData(traceType, traces);

  const { queryData, config } = getDefaultQueryAndConfigData(traceType);

  // setMenuData
  model.setState({
    config,
    queryData,
    traceType,
    runHash: run_id,
    isTraceBatchLoading: true,
    runParams,
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

  getRunTraceBatch(true).then().catch();
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

  getRunTraceBatch(true).then().catch();
}

function abortGetTraceBatchBatchRequest() {
  if (getTraceBatchRequestRef) {
    getTraceBatchRequestRef?.abort();
    getTraceBatchRequestRef = null;
  }
}

function getInitialSliderValues(processedData: any, sliderKeys: string[]) {
  const values: Record<string, [number, number]> = {};
  sliderKeys.forEach((key) => {
    values[key] = processedData[key];
  });

  return values;
}

async function getRunTraceBatch(isInitial = false) {
  abortGetTraceBatchBatchRequest();

  const state = model.getState();
  const traceType = state.traceType || 'distributions';
  const requestOptions = state.batchRequestOptions;
  const queryData = state.queryData;

  let paramsToApi = settings[traceType].paramsToApi;

  if (!paramsToApi) {
    paramsToApi = (queryData?: QueryData) => {
      return {
        ...(!isInitial ? reformatArrayQueries(queryData?.sliders) : {}),
        ...queryData?.inputs,
      };
    };
  }

  getTraceBatchRequestRef = runsService.getBatch(
    state.runHash || '',
    traceType,
    paramsToApi(queryData),
    [requestOptions?.trace],
  );
  try {
    model.setState({
      ...state,
      batchRequestOptions: {
        ...requestOptions,
        params: queryData,
      },
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
    const parsed = settings[state.traceType || 'distributions'].dataProcessor(
      data,
      state?.runParams,
    );
    if (isInitial) {
      const sliders = getInitialSliderValues(
        parsed,
        Object.keys(queryData?.sliders || {}),
      );
      if (queryData) {
        queryData.sliders = sliders;
      }
    }

    model.setState({
      ...state,
      data: parsed,
      queryData,
      isTraceBatchLoading: false,
    });
  } catch (e) {
    model.setState({
      ...state,
      isTraceBatchLoading: false,
    });
    // @TODO handle exception
    throw e;
  }
}

function onInputChange(name: string, value: number) {
  const state = model.getState();
  model.setState({
    ...state,
    queryData: {
      ...state.queryData,
      inputs: {
        ...state.queryData?.inputs,
        [name]: +value,
      },
    },
  });
}

function onRangeChange(name: string, value: number | number[]) {
  const state = model.getState();
  model.setState({
    ...state,
    queryData: {
      ...state.queryData,
      sliders: {
        ...state.queryData?.sliders,
        [name]: value,
      },
    },
  });
}

function onApply() {
  getRunTraceBatch().then().catch();
}

function destroy() {
  model.destroy();
  abortGetTraceBatchBatchRequest();
}

export default {
  ...model,
  destroy,
  onApply,
  initialize,
  onInputChange,
  onRangeChange,
  changeActiveItemKey,
};
