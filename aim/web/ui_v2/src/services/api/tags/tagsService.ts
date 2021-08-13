import API from '../api';

const endpoints = {
  GET_TAGS: 'tags',
  GET_TAG: 'tags/',
  CREATE_TAG: 'tags',
  UPDATE_TAG: 'tags/',
};

function getTags() {
  return API.get(endpoints.GET_TAGS);
}

function createTag(body: object) {
  return API.post(endpoints.GET_TAGS, body);
}

function updateTag(body: object, id: string) {
  return API.put(endpoints.UPDATE_TAG + id, body);
}

function getTagById(id: string) {
  return API.get(endpoints.GET_TAG + id);
}

const tagsService = {
  endpoints,
  getTags,
  createTag,
  updateTag,
  getTagById,
};

export default tagsService;
