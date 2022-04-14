import {
  INoteReqBody,
  INote,
  INotesList,
} from 'types/services/models/notes/notes';
import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  GET_NOTES_LIST: (run_id: string): string => `runs/${run_id}/note`,
  CREATE_NOTE: (run_id: string): string => `runs/${run_id}/note`,
  GET_SINGLE_NOTE: (run_id: string, note_id: number): string =>
    `runs/${run_id}/note/${note_id}`,
  UPDATE_NOTE: (run_id: string, note_id: number): string =>
    `runs/${run_id}/note/${note_id}`,
  DELETE_NOTE: (run_id: string, note_id: number): string =>
    `runs/${run_id}/note/${note_id}`,
};

function getNotes(runId: string): IApiRequest<INotesList> {
  return API.get(endpoints.GET_NOTES_LIST(runId));
}

function createNote(runId: string, reqBody: INoteReqBody): IApiRequest<INote> {
  return API.post(endpoints.CREATE_NOTE(runId), reqBody, {
    headers: { 'Content-type': 'application/json' },
  });
}

function getSingleNote(runId: string, noteId: number): IApiRequest<INote> {
  return API.get(endpoints.GET_SINGLE_NOTE(runId, noteId));
}

function updateNote(
  runId: string,
  noteId: number,
  reqBody: INoteReqBody,
): IApiRequest<any> {
  return API.put(endpoints.UPDATE_NOTE(runId, noteId), reqBody, {
    headers: { 'Content-type': 'application/json' },
  });
}

function deleteNote(runId: string, noteId: number): IApiRequest<any> {
  return API.delete(endpoints.DELETE_NOTE(runId, noteId));
}

const notesService = {
  getNotes,
  getSingleNote,
  createNote,
  updateNote,
  deleteNote,
};

export default notesService;
