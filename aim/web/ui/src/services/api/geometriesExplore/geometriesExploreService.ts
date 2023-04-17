import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  GET_GEOMETRIES: 'runs/search/geometries',
  GET_GEOMETRIES_BY_URIS: 'runs/geometries/get-batch',
};

function getGeometriesExploreData(params: {}): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoints.GET_GEOMETRIES, params);
}

function getGeometriesByURIs(body: string[]): IApiRequest<any> {
  return API.getStream<IApiRequest<any>>(
    endpoints.GET_GEOMETRIES_BY_URIS,
    body,
    {
      method: 'POST',
    },
  );
}

const geometriesExploreService = {
  endpoints,
  getGeometriesExploreData,
  getGeometriesByURIs,
};

export default geometriesExploreService;
