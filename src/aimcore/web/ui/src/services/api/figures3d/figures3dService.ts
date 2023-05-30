import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  GET_FIGURES3D: 'runs/search/figures3d',
  GET_FIGURES3D_BY_URIS: 'runs/figures3d/get-batch',
};

function getFiigures3DData(params: {}): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoints.GET_FIGURES3D, params);
}

function getFigures3DByURIs(body: string[]): IApiRequest<any> {
  return API.getStream<IApiRequest<any>>(
    endpoints.GET_FIGURES3D_BY_URIS,
    body,
    {
      method: 'POST',
    },
  );
}

const figures3dService = {
  endpoints,
  getFiigures3DData,
  getFigures3DByURIs,
};

export default figures3dService;
