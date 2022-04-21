import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { NotesNotificationsEnum } from 'config/notification-messages/notificationMessages';

import notesService from 'services/api/notes/notesService';
import * as analytics from 'services/analytics';

import {
  INote,
  INoteReqBody,
  INotesAppModelState,
  INotesList,
} from 'types/services/models/notes/notes';
import { IApiRequest } from 'types/services/services';

import onNotificationAdd from 'utils/app/onNotificationAdd';
import exceptionHandler from 'utils/app/exceptionHandler';
import onNotificationDelete from 'utils/app/onNotificationDelete';

import createModel from '../model';

const model = createModel<Partial<INotesAppModelState>>({
  isLoading: true,
  noteData: undefined,
  notifyData: [],
});

// Request references
let getNotesListRequestRef: IApiRequest<any>;

// Initializing model
function initialize(runId: string): void {
  model.init();
  try {
    getNotesListRequestRef = onNotesListFetch(runId);
    getNotesListRequestRef.call();
  } catch (err: any) {
    handleErrorNotification(err);
    getNotesListRequestRef?.abort();
    model.setState({ isLoading: false });
  }
}

// API CRUD functionality

function onNotesListFetch(runId: string) {
  const { call, abort } = notesService.getNotes(runId);
  return {
    call: async () => {
      call((detail: any) => {
        exceptionHandler({ detail, model });
        model.setState({ isLoading: false });
      }).then(async (data: INotesList) => {
        model.setState({
          noteData: data[0],
          isLoading: false,
        });
      });
    },
    abort,
  };
}

function onNoteCreate(runId: string, reqBody: INoteReqBody): void {
  analytics.trackEvent(
    ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.clickSaveButton,
  );
  const { call, abort } = notesService.createNote(runId, reqBody);
  try {
    model.setState({ isLoading: true });
    call((detail: any) => {
      exceptionHandler({ detail, model });
      model.setState({ isLoading: false });
    }).then((noteData: INote) => {
      model.setState({
        noteData: {
          content: reqBody.content,
          id: noteData.id,
          created_at: noteData.created_at,
        },
        isLoading: false,
      });
      handleSuccessNotification(NotesNotificationsEnum.CREATE);
    });
  } catch (err: any) {
    abort();
    handleErrorNotification(err);
    model.setState({
      isLoading: false,
    });
  }
}

function onNoteUpdate(runId: string, reqBody: INoteReqBody): void {
  const { id, created_at } = model.getState().noteData!;
  const { call, abort } = notesService.updateNote(runId, id, reqBody);
  analytics.trackEvent(
    ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.clickUpdateButton,
  );
  try {
    model.setState({
      isLoading: true,
    });
    call((detail: any) => {
      exceptionHandler({ detail, model });
      model.setState({ isLoading: false });
    }).then((noteData: INote) => {
      model.setState({
        noteData: { ...noteData, created_at },
        isLoading: false,
      });
      handleSuccessNotification(NotesNotificationsEnum.UPDATE);
    });
  } catch (err: any) {
    abort();
    handleErrorNotification(err);
    model.setState({ isLoading: false });
  }
}

function onNoteDelete(runId: string): void {
  const { id } = model.getState().noteData!;
  const { call, abort } = notesService.deleteNote(runId, id);
  analytics.trackEvent(
    ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.clickDeleteButton,
  );
  try {
    model.setState({
      isLoading: true,
    });
    call((detail: any) => {
      exceptionHandler({ detail, model });
      model.setState({ isLoading: false });
    }).then((response: { status: string }) => {
      model.setState({
        noteData: null,
        isLoading: false,
      });
      handleSuccessNotification(NotesNotificationsEnum.DELETE);
    });
  } catch (err: any) {
    abort();
    handleErrorNotification(err);
    model.setState({ isLoading: false });
  }
}

// Notification Handlers
function handleErrorNotification(err: any): void {
  onNotificationAdd({
    notification: {
      id: Date.now(),
      messages: [err.message],
      severity: 'error',
    },
    model,
  });
}

function handleSuccessNotification(message: NotesNotificationsEnum): void {
  onNotificationAdd({
    notification: {
      id: Date.now(),
      messages: [message],
      severity: 'success',
    },
    model,
  });
}

function onNoteNotificationDelete(id: number): void {
  onNotificationDelete({ id, model });
}

// Destroying model on component unmount
function destroy(): void {
  getNotesListRequestRef?.abort();
  model.destroy();
}

const notesModel = {
  ...model,
  initialize,
  destroy,
  onNoteCreate,
  onNoteUpdate,
  onNoteDelete,
  onNoteNotificationDelete,
};

export default notesModel;
