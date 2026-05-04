import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  GET_VIDEOS: 'runs/search/videos',
  GET_VIDEOS_BY_URIS: 'runs/videos/get-batch',
};

function getVideosExploreData(params: {}): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoints.GET_VIDEOS, params);
}

function getVideosByURIs(body: string[]): IApiRequest<any> {
  return API.getStream<IApiRequest<any>>(endpoints.GET_VIDEOS_BY_URIS, body, {
    method: 'POST',
  });
}

const videosExploreService = {
  endpoints,
  getVideosExploreData,
  getVideosByURIs,
};

export default videosExploreService;
