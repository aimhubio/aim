import _ from 'lodash-es';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { ResizeModeEnum } from 'config/enums/tableEnums';
import { RowHeightSize } from 'config/table/tableConfigs';

import appsService from 'services/api/apps/appsService';
import textExplorerService from 'services/api/textExplorer/textExplorerService';

import { IAppData } from 'types/services/models/metrics/metricsAppModel';
import {
  ITextExplorerAppConfig,
  ITextExplorerAppModelState,
} from 'types/services/models/textExplorer/texteExplorerAppModel';
import {
  ISelectConfig,
  ISelectOption,
} from 'types/services/models/explorer/createAppModel';

import { getCompatibleSelectConfig } from 'utils/app/getCompatibleSelectConfig';
import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import { formatValue } from 'utils/formatValue';
import getUrlWithParam from 'utils/getUrlWithParam';
import { decode, encode } from 'utils/encoder/encoder';
import { getItem, setItem } from 'utils/storage';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

import createModel from '../model';
import projectsService from '../../api/projects/projectsService';
import { IProjectParamsMetrics } from '../../../types/services/models/projects/projectsModel';
import { getParamsSuggestions } from '../../../utils/app/getParamsSuggestions';
import COLORS from '../../../config/colors/colors';
import contextToString from '../../../utils/contextToString';
import alphabeticalSortComparator from '../../../utils/alphabeticalSortComparator';
import { IImagesExploreAppConfig } from '../../../types/services/models/imagesExplore/imagesExploreAppModel';
import getStateFromUrl from '../../../utils/getStateFromUrl';

const model = createModel<Partial<ITextExplorerAppModelState>>({
  requestStatus: RequestStatusEnum.NotRequested,
  searchButtonDisabled: false,
  applyButtonDisabled: true,
  selectFormData: {
    options: undefined,
    suggestions: [],
  },
});

function getConfig(): ITextExplorerAppConfig {
  return {
    select: {
      options: [],
      query: '',
      advancedMode: false,
      advancedQuery: '',
    },
    text: {
      indexDensity: '5',
      recordDensity: '50',
      inputsValidations: {},
    },
    table: {
      resizeMode: ResizeModeEnum.Resizable,
      rowHeight: RowHeightSize.md,
      sortFields: [],
      hiddenMetrics: [],
      hiddenColumns: [],
      hideSystemMetrics: undefined,
      columnsWidths: {},
      columnsOrder: {
        left: [],
        middle: [],
        right: [],
      },
      height: '0.5',
    },
  };
}

let appRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<IAppData>;
  abort: () => void;
};

let textsRequestRef: {
  call: (exceptionHandler: (detail: any) => void) => Promise<IAppData>;
  abort: () => void;
};

function getSelectFormOptions(projectsData: IProjectParamsMetrics) {
  let data: ISelectOption[] = [];
  let index: number = 0;
  if (projectsData?.images) {
    for (let key in projectsData.images) {
      data.push({
        label: key,
        group: key,
        color: COLORS[0][index % COLORS[0].length],
        value: {
          option_name: key,
          context: null,
        },
      });
      index++;

      for (let val of projectsData.images[key]) {
        if (!_.isEmpty(val)) {
          let label = contextToString(val);
          data.push({
            label: `${key} ${label}`,
            group: key,
            color: COLORS[0][index % COLORS[0].length],
            value: {
              option_name: key,
              context: val,
            },
          });
          index++;
        }
      }
    }
  }

  return data.sort(
    alphabeticalSortComparator<ISelectOption>({ orderBy: 'label' }),
  );
}

function initialize(appId: string): void {
  model.init();
  model.setState({
    refs: {
      tableRef: { current: null },
    },
    groupingSelectOptions: [],
  });
  if (!appId) {
    setDefaultAppConfigData();
  }
  projectsService
    .getProjectParams(['texts'])
    .call()
    .then((data: IProjectParamsMetrics) => {
      model.setState({
        selectFormData: {
          options: getSelectFormOptions(data),
          suggestions: getParamsSuggestions(data),
        },
      });
    });
}

function getAppConfigData(appId: string) {
  if (appRequestRef) {
    appRequestRef.abort();
  }
  appRequestRef = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequestRef.call((detail: any) => {
        exceptionHandler({ detail, model });
      });
      let select = appData?.state?.select;
      if (select) {
        const compatibleSelectConfig = getCompatibleSelectConfig(
          ['texts'],
          select,
        );
        appData.state = {
          ...appData.state,
          select: {
            ...compatibleSelectConfig,
          },
        };
      }
      const configData: any = _.merge(getConfig(), appData.state);
      model.setState({ config: configData });
    },
    abort: appRequestRef.abort,
  };
}

function resetModelState() {}

function abortRequest(): void {
  if (textsRequestRef) {
    textsRequestRef.abort();
  }
  model.setState({
    requestStatus: RequestStatusEnum.Ok,
  });
  onNotificationAdd({
    notification: {
      id: Date.now(),
      severity: 'info',
      messages: ['Request has been cancelled'],
    },
    model,
  });
}

function setDefaultAppConfigData() {
  const compatibleSelectConfig = getCompatibleSelectConfig(
    ['texts'],
    getStateFromUrl('select'),
  );
  const select: ISelectConfig = compatibleSelectConfig || getConfig().select;
  const images: ITextExplorerAppConfig['text'] =
    getStateFromUrl('images') || getConfig().text;
  const tableConfigHash = getItem('imagesExploreTable');
  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;
  const configData = _.merge(getConfig(), {
    select,
    table,
    images,
  });

  model.setState({ config: configData });
}

function getQueryStringFromSelect(selectData: any) {
  let query: string | undefined = '';
  if (selectData !== undefined) {
    if (selectData.advancedMode) {
      query = selectData.advancedQuery;
    } else {
      query = `${
        selectData.query ? `${selectData.query} and ` : ''
      }(${selectData.options
        .map(
          (option: ISelectOption) =>
            `(texts.name == "${option.value?.option_name}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map(
                      (item) =>
                        `texts.context.${item} == ${formatValue(
                          (option.value?.context as any)[item],
                        )}`,
                    )
                    .join(' and ')
            })`,
        )
        .join(' or ')})`.trim();
    }
  }

  return query;
}
/**
 * function updateURL has 2 major functionalities:
 *    1. Keeps URL in sync with the app config
 *    2. Stores updated URL in localStorage if App is not in the bookmark state
 * @param {ITextExplorerAppConfig} configData - the current state of the app config
 */
function updateURL(
  configData: ITextExplorerAppConfig = model.getState()!.config!,
) {
  const { select, text } = configData;
  const url: string = getUrlWithParam({
    select: encode(select as {}),
    text: encode(text),
  });

  if (url === `${window.location.pathname}${window.location.search}`) {
    return;
  }

  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem('textExplorerUrl', url);
  }

  window.history.pushState(null, '', url);
}

async function getTextMetricsData(stream: IAppData) {
  // @ts-ignore
  let gen = adjustable_reader(stream);
  let buffer_pairs = decode_buffer_pairs(gen);
  let decodedPairs = decodePathsVals(buffer_pairs);
  let objects = iterFoldTree(decodedPairs, 1);

  const runData = [];
  for await (let [keys, val] of objects) {
    runData.push({
      ...(val as any),
      hash: keys[0],
    });
  }
  return runData;
}

function setModelData(runData: any[], configData: ITextExplorerAppConfig) {}

function getTextData(
  shouldUrlUpdate?: boolean,
  shouldResetSelectedRows?: boolean,
) {
  if (textsRequestRef) {
    textsRequestRef.abort();
  }

  const configData: ITextExplorerAppConfig | undefined =
    model.getState()?.config;

  if (shouldUrlUpdate) {
    updateURL(configData);
  }
  const recordSlice: number[] | undefined = configData?.text?.recordSlice as
    | number[]
    | undefined;
  const indexSlice: number[] | undefined = configData?.text?.indexSlice as
    | number[]
    | undefined;
  const recordDensity = configData?.text?.recordDensity;
  const indexDensity = configData?.text?.indexDensity;
  let query = getQueryStringFromSelect(configData?.select as any);
  let imageDataBody: any = {
    q: query !== '()' ? query : '',
  };
  if (recordSlice) {
    //TODO check values nullability
    imageDataBody = {
      ...imageDataBody,
      record_range: !_.isEmpty(recordSlice)
        ? `${recordSlice[0]}:${recordSlice[1] + 1}`
        : '',
      index_range: !_.isEmpty(indexSlice)
        ? `${indexSlice?.[0]}:${(indexSlice?.[1] || 0) + 1}`
        : '',
      record_density: recordDensity ?? '',
      index_density: indexDensity ?? '',
    };
  }
  textsRequestRef = textExplorerService.getTextExplorerData(imageDataBody);
  return {
    call: async () => {
      if (query !== '()') {
        model.setState({
          requestStatus: RequestStatusEnum.Pending,
          queryIsEmpty: false,
          applyButtonDisabled: false,
          selectedRows: shouldResetSelectedRows
            ? {}
            : model.getState()?.selectedRows,
        });
        try {
          const stream = await textsRequestRef.call((detail) => {
            exceptionHandler({ detail, model });
            resetModelState();
          });
          const runData = await getTextMetricsData(stream);

          if (configData) {
            setModelData(runData, configData);
          }
        } catch (ex: Error | any) {
          if (ex.name === 'AbortError') {
            // Abort Error
          } else {
            console.log('Unhandled error: ', ex);
          }
        }
      } else {
        model.setState({
          selectedRows: shouldResetSelectedRows
            ? {}
            : model.getState()?.selectedRows,
          queryIsEmpty: true,
          imagesData: {},
          tableData: [],
          images: {
            tooltip: {
              content: {},
              display: true,
              selectedParams: [],
            },
            focusedState: {
              active: false,
              key: null,
            },
          },
          config: {
            ...configData,
            // grouping: { ...getConfig().grouping },
            table: {
              ...configData?.table,
              resizeMode: ResizeModeEnum.Resizable,
            },
          },
        });
      }
    },
    abort: textsRequestRef.abort,
  };
}

const imagesExploreAppModel = {
  ...model,
  initialize,
  getTextData,
  abortRequest,
  getAppConfigData,
  onNotificationAdd,
  setDefaultAppConfigData,
};

export default imagesExploreAppModel;
