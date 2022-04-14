import React from 'react';
import classNames from 'classnames';

import { Editor } from '@toast-ui/react-editor';
import { Tooltip } from '@material-ui/core';

import { Button, Icon } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import Spinner from 'components/kit/Spinner';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useModel from 'hooks/model/useModel';

import * as analytics from 'services/analytics';
import notesModel from 'services/models/notes/notesModel';

import { INoteReqBody } from 'types/services/models/notes/notes';

import useNotesResizePanel from '../hooks/useNotesResizePanel';

import { INotesTabProps } from './types';

import '@toast-ui/editor/dist/toastui-editor.css';
import './NotesTab.scss';

function NotesTab({ runHash }: INotesTabProps) {
  const [openModal, setOpenModal] = React.useState(false);
  const { isLoading, noteData, notifyData } = useModel(notesModel)!;
  const editorRef = React.useRef<Editor | any>(null);
  const wrapperRef = React.useRef<any>();
  useNotesResizePanel(wrapperRef, editorRef);

  React.useEffect(() => {
    notesModel.initialize(runHash);
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.tabView);
    return () => {
      notesModel.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    editorRef.current.editorInst.setMarkdown(
      noteData?.id ? noteData?.content : '',
    );
  }, [noteData]);

  // CRUD handlers
  function onNoteSave() {
    if (noteData?.id) {
      onNoteUpdate();
    } else {
      notesModel.onNoteCreate(runHash, {
        content: editorRef.current.editorInst.getMarkdown(),
      } as INoteReqBody);
    }
  }

  const onNoteDelete = React.useCallback(() => {
    handleCloseModal();
    notesModel.onNoteDelete(runHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onNoteUpdate(): void {
    notesModel.onNoteUpdate(runHash, {
      content: editorRef.current.editorInst.getMarkdown(),
    } as INoteReqBody);
  }

  // Confirm modal handlers
  const handleOpenModal: () => void = React.useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleCloseModal: () => void = React.useCallback(() => {
    setOpenModal(false);
  }, []);

  return (
    <section ref={wrapperRef} className='NotesTab'>
      <div
        className={classNames('NotesTab__Editor', {
          isLoading,
        })}
      >
        <Editor
          previewStyle='vertical'
          initialEditType='markdown'
          height='calc(100vh - 146px)'
          ref={editorRef}
        />
        <div className='NotesTab__Editor__actionBtns'>
          <Tooltip title='Delete Note'>
            <div>
              <Button
                color='secondary'
                size='small'
                onClick={handleOpenModal}
                withOnlyIcon
                disabled={!noteData?.id}
              >
                <Icon name='delete' />
              </Button>
            </div>
          </Tooltip>

          <Tooltip title={`${noteData?.id ? 'Update' : 'Save'} Note`}>
            <div>
              <Button variant='contained' size='small' onClick={onNoteSave}>
                {noteData?.id ? 'Update' : 'Save'}
              </Button>
            </div>
          </Tooltip>
        </div>
        <ConfirmModal
          open={openModal}
          onCancel={handleCloseModal}
          onSubmit={onNoteDelete}
          text='Are you sure you want to delete this Note?'
          icon={<Icon name='delete' />}
          title='Please Confirm'
          statusType='error'
          confirmBtnText='Delete'
        />
        {isLoading && <Spinner />}
      </div>
      {notifyData!.length > 0 && (
        <NotificationContainer
          handleClose={notesModel.onNoteNotificationDelete}
          data={notifyData!}
        />
      )}
    </section>
  );
}

NotesTab.displayName = 'NotesTab';

export default React.memo(NotesTab);
