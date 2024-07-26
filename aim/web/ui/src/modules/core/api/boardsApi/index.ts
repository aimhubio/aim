import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { BoardData, BoardsRequestBody, TemplateData } from './types.d';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.BOARDS.BASE}`);

/**
 * function fetchBoardsList
 * this call is used for fetching boards list.
 * @returns {Promise<BoardData[]>}
 */
async function fetchBoardsList(): Promise<string[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.BOARDS.GET)).body;
}

/**
 * function fetchBoard by id
 * this call is used for fetching a board by id.
 * @param id - id of board
 * @returns {Promise<BoardData>}
 */

async function fetchBoardByPath(path: string): Promise<BoardData> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.BOARDS.GET}${path}`)).body;
}

/**
 * function createBoard
 * this call is used for creating new board.
 * @param reqBody - query body params
 * @returns {Promise<BoardsRequestBody>}
 */

async function createBoard(reqBody: BoardsRequestBody): Promise<BoardData> {
  return (
    await api.makeAPIPostRequest(ENDPOINTS.BOARDS.CREATE, {
      body: reqBody,
    })
  ).body;
}

/**
 * function updateBoard
 * this call is used for updating a board by id.
 * @param id - id of board
 * @param reqBody - query body params
 * @returns {Promise<BoardData>}
 */

async function updateBoard(
  id: string,
  reqBody: BoardsRequestBody,
): Promise<BoardData> {
  return (
    await api.makeAPIPutRequest(`${ENDPOINTS.BOARDS.UPDATE}${id}`, {
      body: reqBody,
    })
  ).body;
}

/**
 * function deleteBoard
 * this call is used for deleting a board by id.
 * @param id - id of board
 * @returns {Promise<BoardData>}
 */

async function deleteBoard(id: string): Promise<BoardData> {
  return (await api.makeAPIDeleteRequest(`${ENDPOINTS.BOARDS.DELETE}/${id}`))
    .body;
}

/**
 * function resetBoardById
 * this call is used for resetting a board by id.
 * @param id - id of board
 * @returns {Promise<BoardData>}
 */

async function resetBoardById(id: string): Promise<BoardData> {
  return (await api.makeAPIPostRequest(`${ENDPOINTS.BOARDS.RESET}/${id}`)).body;
}

/**
 * function fetchBoardsTemplates
 * this call is used for fetching boards templates.
 * @returns {Promise<TemplateData[]>}
 */

async function fetchBoardsTemplates(): Promise<TemplateData[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.BOARDS.TEMPLATES)).body;
}

/**
 * function fetchTemplate by id
 * this call is used for fetching a template by id.
 * @param id - id of template
 * @returns {Promise<TemplateData>}
 */

async function fetchTemplateById(id: string): Promise<TemplateData> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.BOARDS.TEMPLATES}/${id}`))
    .body;
}

export * from './types.d';
export {
  fetchBoardsList,
  fetchBoardByPath,
  createBoard,
  updateBoard,
  deleteBoard,
  resetBoardById,
  fetchBoardsTemplates,
  fetchTemplateById,
};
