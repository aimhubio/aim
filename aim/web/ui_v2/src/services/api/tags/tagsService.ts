import API from '../api';

const endpoints = {
  GET_TAGS: 'tags',
  GET_TAG: 'tags/',
  CREATE_TAG: 'tags',
  UPDATE_TAG: 'tags/',
  GET_TAG_RUNS: (id: string) => `tags/${id}/runs`,
};

function getTags() {
  return API.get(endpoints.GET_TAGS);
}

function getTagRuns(id: string) {
  return API.get(endpoints.GET_TAG_RUNS(id));
}

function createTag(body: object) {
  return API.post(endpoints.GET_TAGS, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function updateTag(body: object, id: string) {
  return API.put(endpoints.UPDATE_TAG + id, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTagById(id: string) {
  return API.get(endpoints.GET_TAG + id);
}

function hideTag(id: string, archived: boolean) {
  return API.put(
    endpoints.GET_TAG + id,
    { archived },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}

const tagsService = {
  endpoints,
  getTags,
  createTag,
  updateTag,
  getTagById,
  getTagRuns,
  hideTag,
};

export default tagsService;
