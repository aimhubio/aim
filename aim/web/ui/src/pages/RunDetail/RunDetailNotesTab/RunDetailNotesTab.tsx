import React from 'react';
import classNames from 'classnames';
import Editor from 'rich-markdown-editor';
import moment from 'moment';
import { useModel } from 'hooks';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import Spinner from 'components/kit/Spinner';
import RouteLeavingGuard from 'components/RouteLeavingGuard';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { RichEditorThemeColors } from 'config/colors/colors';
import { YEAR_MONTH_DAY_DATE_FORMAT } from 'config/dates/dates';

import * as analytics from 'services/analytics';
import notesModel from 'services/models/notes/notesModel';

import { INoteReqBody } from 'types/services/models/notes/notes';

import NoteTooltip from './NoteTooltip';
import { IRunDetailNotesTabProps } from './types';

import './RunDetailNotesTab.scss';

function RunDetailNotesTab({
  runHash,
}: IRunDetailNotesTabProps): React.FunctionComponentElement<React.ReactNode> {
  const { isLoading, noteData, notifyData } = useModel(notesModel)!;
  const [value, setValue] = React.useState<string>('');
  const [saveDisabled, setSaveDisabled] = React.useState<boolean>(true);
  const [theme, setTheme] = React.useState<null | {}>(null);
  const editorRef = React.useRef<Editor | any>(null);

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
        ...RichEditorThemeColors,
      });
    }
  }, [noteData]);

  // CRUD handlers
  const onNoteSave = React.useCallback((): void => {
    setSaveDisabled(true);
    if (noteData?.id) {
      onNoteUpdate();
    } else {
      notesModel.onNoteCreate(runHash, {
        content: editorRef.current.value(),
      } as INoteReqBody);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteData?.id, runHash]);

  const onNoteUpdate = React.useCallback((): void => {
    notesModel.onNoteUpdate(runHash, {
      content: editorRef.current.value(),
    } as INoteReqBody);
  }, [runHash]);

  const onNoteChange = React.useCallback(
    (currentVal: () => string): void => {
      const isSaveDisabled: boolean = value === currentVal();
      if (saveDisabled !== isSaveDisabled) {
        setSaveDisabled(isSaveDisabled);
      }
    },
    [saveDisabled, value],
  );

  return (
    <section className='RunDetailNotesTab'>
      <RouteLeavingGuard when={!saveDisabled} />
      <div
        className={classNames('RunDetailNotesTab__Editor', {
          isLoading,
        })}
      >
        <div className='RunDetailNotesTab__Editor__actionPanel'>
          <div className='RunDetailNotesTab__Editor__actionPanel__info'>
            {noteData?.created_at && (
              <Tooltip title='Created at'>
                <div className='RunDetailNotesTab__Editor__actionPanel__info-field'>
                  <Icon name='calendar' />
                  <Text tint={70}>
                    {`${moment
                      .utc(noteData?.created_at)
                      .local()
                      .format(YEAR_MONTH_DAY_DATE_FORMAT)}`}
                  </Text>
                </div>
              </Tooltip>
            )}
            {noteData?.updated_at && (
              <Tooltip title='Updated at'>
                <div className='RunDetailNotesTab__Editor__actionPanel__info-field'>
                  <Icon name='time' />
                  <Text tint={70}>
                    {`${moment
                      .utc(noteData?.updated_at)
                      .local()
                      .format(YEAR_MONTH_DAY_DATE_FORMAT)}`}
                  </Text>
                </div>
              </Tooltip>
            )}
          </div>
          <Tooltip title='Save Note'>
            <div>
              <Button
                disabled={saveDisabled || isLoading}
                variant='contained'
                size='small'
                onClick={onNoteSave}
                className='RunDetailNotesTab__Editor__actionPanel__saveBtn'
              >
                Save
              </Button>
            </div>
          </Tooltip>
        </div>
        <Editor
          ref={editorRef}
          className='RunDetailNotesTab__Editor__container'
          value={value}
          placeholder='Leave your Note'
          theme={theme || editorRef.current?.theme()}
          disableExtensions={['table', 'image', 'container_notice']}
          tooltip={({ children }) => {
            return <NoteTooltip>{children}</NoteTooltip>;
          }}
          onChange={onNoteChange}
        />
        {isLoading && (
          <div className='RunDetailNotesTab__spinnerWrapper'>
            <Spinner />
          </div>
        )}
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

RunDetailNotesTab.displayName = 'RunDetailNotesTab';

export default React.memo(RunDetailNotesTab);
