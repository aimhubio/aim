import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import {
  ICreateTagBody,
  ICreateTagResult,
  IGetTagRunsResult,
  ITagData,
  IUpdateTagBody,
} from './types';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.TAGS.BASE}`);

/**
 * function fetchTagsList
 * this call is used for fetching tags list.
 * @returns {Promise<ITagData[]>}
 */
async function fetchTagsList(): Promise<ITagData[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.TAGS.GET)).body;
}

/**
 * function getTagById
 * this call is used for getting a tag by id.
 * @param id - id of tag
 * @returns {Promise<ITagData>}
 */
async function getTagById(id: string): Promise<ITagData> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.TAGS.GET}/${id}`)).body;
}

/**
 * function getTagRuns
 * this call is used for fetching a runs which have a tag by id.
 * @param id - id of tag
 * @returns {Promise<IGetTagRunsResult[]>}
 */
async function getTagRuns(id: string): Promise<IGetTagRunsResult[]> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.TAGS.GET}/${id}/runs`)).body;
}

/**
 * function createTag
 * this call is used for creating new tag.
 * @param reqBody - query body params
 * @returns {Promise<ICreateTagResult>}
 */
async function createTag(reqBody: ICreateTagBody): Promise<ICreateTagResult> {
  return (
    await api.makeAPIPostRequest(ENDPOINTS.TAGS.CREATE, {
      body: reqBody,
    })
  ).body;
}

/**
 * function updateTag
 * this call is used for updating a tag by id.
 * @param reqBody - query body params
 * @param id - id of tag
 * @returns {Promise<ICreateTagResult>}
 */
async function updateTag(
  reqBody: IUpdateTagBody,
  id: string,
): Promise<ICreateTagResult> {
  return (
    await api.makeAPIPutRequest(`${ENDPOINTS.TAGS.UPDATE}/${id}`, {
      body: reqBody,
    })
  ).body;
}

/**
 * function archiveTag
 * this call is used for archiving a tag by id.
 * @param id - id of tag
 * @param archived - archived status
 * @returns {Promise<ICreateTagResult>}
 */
async function archiveTag(
  id: string,
  archived: boolean,
): Promise<ICreateTagResult> {
  return (
    await api.makeAPIPutRequest(`${ENDPOINTS.TAGS.UPDATE}/${id}`, {
      body: { archived },
    })
  ).body;
}

/**
 * function deleteTag
 * this call is used for deleting a tag by id.
 * @param id - id of tag
 * @returns {Promise<any>}
 */
async function deleteTag(id: string): Promise<any> {
  return (await api.makeAPIDeleteRequest(`${ENDPOINTS.TAGS.DELETE}/${id}`))
    .body;
}

export {
  fetchTagsList,
  getTagRuns,
  createTag,
  updateTag,
  getTagById,
  archiveTag,
  deleteTag,
};
