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

import { INotesTabProps } from './types';

import '@toast-ui/editor/dist/toastui-editor.css';
import './NotesTab.scss';

function NotesTab({ runHash }: INotesTabProps) {
  const [openModal, setOpenModal] = React.useState(false);
  const { isLoading, noteData, notifyData } = useModel(notesModel)!;
  const editorRef = React.useRef<Editor | any>(null);
  const wrapperRef = React.useRef<any>();
  const leftPanelRef = React.useRef<any>();
  const rightPanelRef = React.useRef<any>();
  const resizeElemRef = React.useRef<any>();
  const frameRef = React.useRef<number>();
  const panelRef = React.useRef<any>();
  React.useEffect(() => {
    notesModel.initialize(runHash);
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.tabView);
    return () => {
      notesModel.destroy();
    };
  }, []);

  React.useEffect(() => {
    editorRef.current.editorInst.setMarkdown(
      noteData?.id ? noteData?.content : '',
    );
  }, [noteData]);

  React.useEffect(() => {
    resizeElemRef.current = document.querySelector(
      '.toastui-editor-md-splitter',
    );
    leftPanelRef.current = document.querySelector('.toastui-editor');
    rightPanelRef.current = document.querySelector(
      '.toastui-editor-md-preview',
    );
    panelRef.current = document.querySelector(
      '.RunDetail__runDetailContainer__tabPanel',
    );
    resizeElemRef.current.addEventListener('mousedown', handleResize);
  }, [editorRef.current]);

  function handleResize() {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }

  function startResize(event: any): void {
    wrapperRef.current.style.userSelect = 'none';
    resizeElemRef.current.style.background = '#89b9f2';
    wrapperRef.current.style.cursor = 'col-resize';
    if (leftPanelRef.current && rightPanelRef.current && wrapperRef.current) {
      const containerWidth: number =
        wrapperRef.current.getBoundingClientRect().width;
      const width: number =
        event.pageX -
        panelRef.current.offsetLeft -
        wrapperRef.current.offsetLeft;
      leftPanelRef.current.style.width = `${width}px`;
      rightPanelRef.current.style.width = `${containerWidth - width}px`;
    }
  }

  function endResize(): void {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
    if (wrapperRef?.current && resizeElemRef?.current) {
      wrapperRef.current.style.userSelect = 'unset';
      wrapperRef.current.style.cursor = 'unset';
      resizeElemRef.current.style.background = '#e8f1fc';
      document.removeEventListener('mousemove', startResize);
    }
  }

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
