import { getAPIHost } from 'config/config';

import ENDPOINTS from 'services/api/endpoints';
import NetworkService from 'services/NetworkService';

import { ReportsProps, ReportsRequestBodyProps } from './types.d';

const api = new NetworkService(`${getAPIHost()}${ENDPOINTS.REPORTS.BASE}`);

/**
 * function fetchReportsList
 * this call is used for fetching reports list.
 * @returns {Promise<any[]>}
 */

async function fetchReportsList(): Promise<any[]> {
  return (await api.makeAPIGetRequest(ENDPOINTS.REPORTS.GET)).body;
}

/**
 * function fetchReport
 * this call is used for fetching a report by id.
 * @param id - id of report
 * @returns {Promise<any>}
 */
async function fetchReport(id: string): Promise<ReportsProps> {
  return (await api.makeAPIGetRequest(`${ENDPOINTS.REPORTS.GET}${id}`)).body;
}

/**
 * function createReport
 * this call is used for creating new report.
 * @param reqBody - query body params
 * @returns {Promise<any>}
 */
async function createReport(
  reqBody: ReportsRequestBodyProps,
): Promise<ReportsProps> {
  return (
    await api.makeAPIPostRequest(`${ENDPOINTS.REPORTS.CREATE}`, {
      body: reqBody,
    })
  ).body;
}

/**
 * function updateReport
 * this call is used for updating a report by id.
 * @param id - id of report
 * @param reqBody - query body params
 * @returns {Promise<any>}
 */
async function updateReport(id: string, reqBody: any): Promise<any> {
  return (
    await api.makeAPIPutRequest(`${ENDPOINTS.REPORTS.UPDATE}${id}`, {
      body: reqBody,
    })
  ).body;
}

/**
 * function deleteReport
 * this call is used for deleting a report by id.
 * @param id - id of report
 * @returns {Promise<any>}
 */
async function deleteReport(id: string): Promise<any> {
  return (await api.makeAPIDeleteRequest(`${ENDPOINTS.REPORTS.DELETE}${id}`))
    .body;
}

export {
  fetchReportsList,
  fetchReport,
  createReport,
  updateReport,
  deleteReport,
};
