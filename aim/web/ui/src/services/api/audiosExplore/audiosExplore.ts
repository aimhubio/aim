import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  GET_AUDIOS: 'runs/search/audios',
  GET_AUDIOS_BY_URIS: 'runs/audios/get-batch',
};

function getAudiosExploreData(params: {}): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoints.GET_AUDIOS, params);
}

function getAudiosByURIs(body: string[]): IApiRequest<any> {
  return API.getStream<IApiRequest<any>>(endpoints.GET_AUDIOS_BY_URIS, body, {
    method: 'POST',
  });
}

const audiosExploreService = {
  endpoints,
  getAudiosExploreData,
  getAudiosByURIs,
};

export default audiosExploreService;
