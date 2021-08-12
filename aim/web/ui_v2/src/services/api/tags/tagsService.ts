import API from '../api';

const endpoints = {
  GET_TAGS: 'tags',
  CREATE_TAG: 'tags',
};

function getTags() {
  return API.get(endpoints.GET_TAGS);
}

const tagsService = {
  endpoints,
  getTags,
};

export default tagsService;
