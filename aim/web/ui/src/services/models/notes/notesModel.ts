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
import { IApiRequestRef } from 'types/services/services';

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
let getNotesListRequestRef: IApiRequestRef<any>;
let createNoteRequestRef: IApiRequestRef<any>;
let updateNoteRequestRef: IApiRequestRef<any>;
let deleteNoteRequestRef: IApiRequestRef<any>;
let getSingleNoteRequestRef: IApiRequestRef<any>;

// API CRUD functionality
function onNotesListFetch(runId: string) {
  const { call, abort } = notesService.getNotes(runId);
  return {
    call: async () => {
      call()
        .then(async (data: INotesList) => {
          model.setState({
            noteData: data[0],
          });
        })
        .finally(() => {
          model.setState({ isLoading: false });
        });
    },
    abort,
  };
}

function onNoteCreate(runId: string, reqBody: INoteReqBody): void {
  model.setState({
    isLoading: true,
  });
  analytics.trackEvent(
    ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.clickSaveButton,
  );
  try {
    model.setState({ isLoading: true });
    createNoteRequestRef = notesService.createNote(runId, reqBody);
    createNoteRequestRef
      .call((detail: any) => {
        exceptionHandler({ detail, model });
        model.setState({ isLoading: false });
      })
      .then((noteData: INote) => {
        model.setState({ noteData, isLoading: false });
        handleSuccessNotification(NotesNotificationsEnum.CREATE);
      });
  } catch (err: any) {
    handleErrorNotification(err);
    createNoteRequestRef.abort();
    model.setState({
      isLoading: false,
    });
  }
}

// function onGetSingleNote(runId: string) {
//   // The number 1 is note id, shouldn't be deleted as long as we creating 1 note for each run.
//   const { call, abort } = notesService.getSingleNote(runId, 1);
//   return {
//     call: async () => {
//       call().then(async (data: INote) => {
//         model.setState({
//           noteData: data,
//           isLoading: false,
//         });
//       });
//     },
//     abort,
//   };
// }

function onNoteUpdate(runId: string, reqBody: INoteReqBody): void {
  analytics.trackEvent(
    ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.clickSaveButton,
  );
  try {
    model.setState({
      isLoading: true,
    });
    // The number 1 is note id, shouldn't be deleted as long as we creating 1 note for each run.
    updateNoteRequestRef = notesService.updateNote(runId, 1, reqBody);
    updateNoteRequestRef
      .call((detail: any) => {
        exceptionHandler({ detail, model });
        model.setState({ isLoading: false });
      })
      .then((noteData: INote) => {
        model.setState({
          noteData,
          isLoading: false,
        });
        handleSuccessNotification(NotesNotificationsEnum.UPDATE);
      });
  } catch (err: any) {
    updateNoteRequestRef.abort();
    handleErrorNotification(err);
    model.setState({ isLoading: false });
  }
}

function onNoteDelete(runId: string): void {
  analytics.trackEvent(
    ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.clickDeleteButton,
  );
  try {
    model.setState({
      isLoading: true,
    });
    // The number 1 is note id, shouldn't be deleted as long as we creating 1 note for each run.
    deleteNoteRequestRef = notesService.deleteNote(runId, 2);
    deleteNoteRequestRef
      .call((detail: any) => {
        exceptionHandler({ detail, model });
        model.setState({ isLoading: false });
      })
      .then((noteData: INote) => {
        console.log(noteData);
        model.setState({
          noteData,
        });
        handleSuccessNotification(NotesNotificationsEnum.DELETE);
      });
  } catch (err: any) {
    deleteNoteRequestRef.abort();
    handleErrorNotification(err);
    model.setState({ isLoading: false });
  }
}

function initialize(runId: string): void {
  model.init();
  try {
    getNotesListRequestRef = onNotesListFetch(runId);
    getNotesListRequestRef.call((detail: any) => {
      exceptionHandler({ detail, model });
      model.setState({ isLoading: false });
    });
  } catch (err: any) {
    handleErrorNotification(err);
    getNotesListRequestRef.abort();
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
  if (createNoteRequestRef) {
    createNoteRequestRef.abort();
  }
  getNotesListRequestRef.abort();
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
