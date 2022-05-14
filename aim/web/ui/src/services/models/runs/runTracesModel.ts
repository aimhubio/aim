// eslint-disable-next-line react-hooks/exhaustive-deps
import _ from 'lodash-es';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import createModel from 'services/models/model';
import runsService from 'services/api/runs/runsService';
import { trackEvent } from 'services/analytics';

import {
  decodeBufferPairs,
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
  VisualizationMenuTitles,
} from './util';

// @TODO implement type
let getTraceBatchRequestRef: any = null;

const model = createModel<Partial<IRunTraceModel>>({});

function getDefaultQueryAndConfigData(traceType: TraceType) {
  const traceSettings = settings[traceType];
  const queryData: QueryData = {
    sliders: {},
    inputs: {},
    inputsValidations: {},
  };
  const config: IConfig = {
    rangePanel: [],
  };

  const inputKeys = Object.keys(traceSettings?.inputs);

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
      inputValidationPatterns: traceSettings.inputValidation,
      infoPropertyName: item?.infoPropertyName,
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
    isApplyBtnDisabled: false,
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
  const traceType = state.traceType || 'distributions';

  const batchRequestTrace = getContextObjFromMenuActiveKey(
    key || '',
    menuState?.availableKeys || [],
  );

  model.setState({
    ...state,
    ...getDefaultQueryAndConfigData(traceType),
    isTraceContextBatchLoading: true,
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

  trackEvent(
    // @ts-ignore
    ANALYTICS_EVENT_KEYS.runDetails.tabs[state.traceType].changeActiveItemKey,
  );
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

  if (traceType === 'figures') {
    getTraceBatchRequestRef = runsService.getBatchByStep(
      state.runHash || '',
      traceType,
      paramsToApi(queryData),
      [requestOptions?.trace],
    );
  } else {
    getTraceBatchRequestRef = runsService.getBatch(
      state.runHash || '',
      traceType,
      paramsToApi(queryData),
      [requestOptions?.trace],
    );
  }
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
      // eslint-disable-next-line no-console
      console.error(detail);
    });

    let bufferPairs = decodeBufferPairs(stream);
    let decodedPairs = decodePathsVals(bufferPairs);
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
        Object.keys(queryData.inputs).forEach((key: string) => {
          const subKey = key.slice(0, key.indexOf('_'));
          const range = parsed[`${subKey}_range`];
          if (
            parsed.processedDataType === VisualizationMenuTitles.figures &&
            (queryData.inputs[key] < range[0] ||
              queryData.inputs[key] > range[1])
          ) {
            queryData.inputs[key] = range[1] ?? 1;
          } else if (
            (parsed.processedDataType !== VisualizationMenuTitles.figures &&
              queryData.inputs[key] < 0) ||
            queryData.inputs[key] > range[1]
          ) {
            const rangeLength = _.range(range[0], range[1] + 1).length;
            queryData.inputs[key] = rangeLength > 0 ? rangeLength : 1;
          } else {
            queryData.inputs[key] = queryData.inputs[key] ?? 1;
          }
        });
      }
    }
    model.setState({
      ...state,
      data: parsed,
      queryData,
      isTraceBatchLoading: false,
      isTraceContextBatchLoading: false,
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

function applyBtnDisabledHandler() {
  const state = model.getState();
  const inputsValidations = state.queryData?.inputsValidations || {};

  const isInputsValid =
    _.size(
      Object.keys(inputsValidations).filter((key) => !inputsValidations[key]),
    ) <= 0;

  model.setState({
    ...state,
    isApplyBtnDisabled: !isInputsValid,
  });
}

function onInputChange(name: string, value: number, isValid: boolean = true) {
  const state = model.getState();
  model.setState({
    ...state,
    queryData: {
      ...state.queryData,
      inputs: {
        ...state.queryData?.inputs,
        [name]: value,
      },
      inputsValidations: {
        ...state.queryData?.inputsValidations,
        [name]: isValid,
      },
    },
  });

  applyBtnDisabledHandler();
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
  const { traceType } = model.getState();
  getRunTraceBatch().then().catch();
  // @ts-ignore
  trackEvent(ANALYTICS_EVENT_KEYS.runDetails.tabs[traceType].clickApplyButton);
}

function destroy() {
  model.destroy();
  abortGetTraceBatchBatchRequest();
}

const runTracesModel = {
  ...model,
  destroy,
  onApply,
  initialize,
  onInputChange,
  onRangeChange,
  changeActiveItemKey,
};

export default runTracesModel;
