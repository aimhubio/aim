import React from 'react';
import classNames from 'classnames';
import Editor from 'rich-markdown-editor';
import moment from 'moment';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import Spinner from 'components/kit/Spinner';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useModel from 'hooks/model/useModel';

import * as analytics from 'services/analytics';
import notesModel from 'services/models/notes/notesModel';

import { INoteReqBody } from 'types/services/models/notes/notes';

import { INotesTabProps } from './types';
import NoteTooltip from './NoteTooltip';

import '@toast-ui/editor/dist/toastui-editor.css';
import './NotesTab.scss';

function NotesTab({ runHash }: INotesTabProps) {
  const [value, setValue] = React.useState<string>('');
  const [saveDisabled, setSaveDisabled] = React.useState<boolean>(true);
  const [theme, setTheme] = React.useState<null | {}>(null);
  const { isLoading, noteData, notifyData } = useModel(notesModel)!;
  const editorRef = React.useRef<Editor | any>(null);
  const wrapperRef = React.useRef<any>();

  React.useEffect(() => {
    notesModel.initialize(runHash);
    analytics.pageView(ANALYTICS_EVENT_KEYS.runDetails.tabs.notes.tabView);
    return () => {
      notesModel.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (editorRef.current) {
      setValue(noteData?.id ? noteData?.content : '');
      setTheme({
        ...editorRef.current?.theme(),
        almostBlack: '#1c2852',
        fontFamily: 'Inter',
        toolbarBackground: '#fff',
        blockToolbarItem: '#1c2852',
        black: '#1c2852',
        blockToolbarIcon: '#414b6d',
        blockToolbarIconSelected: '#414b6d',
        blockToolbarText: '#414b6d',
        blockToolbarTriggerIcon: '#414b6d',
        blockToolbarTextSelected: '#1c2852',
        blockToolbarSelectedBackground: '#f2f5fa',
        blockToolbarHoverBackground: '#f2f5fa',
        blockToolbarDivider: '#E8F1FC',
        toolbarItem: '#414b6d',
        fontFamilyMono: 'Iosevka',
      });
    }
  }, [noteData]);

  // CRUD handlers
  const onNoteSave = React.useCallback(() => {
    setSaveDisabled(true);
    if (noteData?.id) {
      onNoteUpdate();
    } else {
      notesModel.onNoteCreate(runHash, {
        content: editorRef.current.value(),
      } as INoteReqBody);
    }
  }, [noteData?.id, runHash]);

  const onNoteUpdate = React.useCallback(() => {
    notesModel.onNoteUpdate(runHash, {
      content: editorRef.current.value(),
    } as INoteReqBody);
  }, [runHash]);

  const onNoteChange = React.useCallback(
    (val: () => string) => {
      const isSaveDisabled: boolean = value === val();
      if (saveDisabled !== isSaveDisabled) {
        setSaveDisabled(isSaveDisabled);
      }
    },
    [saveDisabled, value],
  );
  return (
    <section ref={wrapperRef} className='NotesTab'>
      <div
        className={classNames('NotesTab__Editor', {
          isLoading,
        })}
      >
        <div className='NotesTab__Editor__actionPanel'>
          <div className='NotesTab__Editor__actionPanel__info'>
            {noteData?.created_at && (
              <Tooltip title='Created At'>
                <div className='NotesTab__Editor__actionPanel__info-field'>
                  <Icon name='calendar' />
                  <Text tint={70}>
                    {`${moment
                      .utc(noteData?.created_at)
                      .local()
                      .format('YYYY-MM-DD HH:mm A')}`}
                  </Text>
                </div>
              </Tooltip>
            )}
            {noteData?.updated_at && (
              <Tooltip title='Updated At'>
                <div className='NotesTab__Editor__actionPanel__info-field'>
                  <Icon name='time' />
                  <Text tint={70}>
                    {`${moment
                      .utc(noteData?.updated_at)
                      .local()
                      .format('YYYY-MM-DD HH:mm A')}`}
                  </Text>
                </div>
              </Tooltip>
            )}
          </div>
          <Tooltip title='Save Note'>
            <div>
              <Button
                disabled={saveDisabled}
                variant='contained'
                size='small'
                onClick={onNoteSave}
              >
                Save
              </Button>
            </div>
          </Tooltip>
        </div>
        <Editor
          ref={editorRef}
          className='NotesTab__Editor__container'
          value={value}
          theme={theme ? theme : editorRef.current?.theme()}
          disableExtensions={['table', 'image', 'container_notice']}
          tooltip={({ children }) => {
            return <NoteTooltip>{children}</NoteTooltip>;
          }}
          onChange={onNoteChange}
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
