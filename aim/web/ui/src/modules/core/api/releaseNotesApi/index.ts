import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { IReleaseNote } from './types';

const api = new NetworkService(
  `${getAPIHost()}${ENDPOINTS.RELEASE_NOTES.BASE}`,
);

/**
 * function fetchReleaseNotes
 * this call is used for fetching release notes list.
 * @returns {Promise<IReleaseNote[]>}
 */
async function fetchReleaseNotes(): Promise<IReleaseNote[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.RELEASE_NOTES.GET)).body;
}

/**
 * function fetchLatestRelease
 * this call is used for fetching latest release note.
 * @returns {Promise<IReleaseNote>}
 */
async function fetchLatestRelease(): Promise<IReleaseNote> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.RELEASE_NOTES.GET}/latest}`))
    .body;
}

/**
 * function fetchLatestReleaseById
 * this call is used for fetching release note by id.
 * @returns {Promise<IReleaseNote>}
 */
async function fetchReleaseById(id: string): Promise<IReleaseNote> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.RELEASE_NOTES.GET}/${id}}`))
    .body;
}

export { fetchReleaseNotes, fetchLatestRelease, fetchReleaseById };
