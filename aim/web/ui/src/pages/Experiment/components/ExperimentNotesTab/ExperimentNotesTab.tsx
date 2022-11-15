import React from 'react';
import moment from 'moment';
import Editor from 'rich-markdown-editor';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Spinner, Text } from 'components/kit';
import RouteLeavingGuard from 'components/RouteLeavingGuard';

import { YEAR_MONTH_DAY_DATE_FORMAT } from 'config/dates/dates';
import { RichEditorThemeColors } from 'config/colors/colors';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import NoteTooltip from 'pages/RunDetail/RunDetailNotesTab/NoteTooltip';

import * as analytics from 'services/analytics';

import useExperimentNotes from './useExperimentNotes';

import { IExperimentNotesTabProps } from '.';

import './ExperimentNotesTab.scss';

function ExperimentNotesTab(
  props: IExperimentNotesTabProps,
): React.FunctionComponentElement<React.ReactNode> {
  const { isLoading, noteData, onNoteCreate, onNoteUpdate } =
    useExperimentNotes(props.experimentId)!;
  const [value, setValue] = React.useState<string>('');
  const [saveDisabled, setSaveDisabled] = React.useState<boolean>(true);
  const [theme, setTheme] = React.useState<null | {}>(null);
  const editorRef = React.useRef<Editor | any>(null);

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
      onNoteUpdate({
        content: editorRef.current.value(),
      }).catch(() => setSaveDisabled(false));
    } else {
      onNoteCreate({
        content: editorRef.current.value(),
      }).catch(() => setSaveDisabled(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteData?.id, props.experimentId]);

  const onNoteChange = React.useCallback(
    (currentVal: () => string): void => {
      const isSaveDisabled: boolean = value === currentVal();
      if (saveDisabled !== isSaveDisabled) {
        setSaveDisabled(isSaveDisabled);
      }
    },
    [saveDisabled, value],
  );

  React.useEffect(() => {
    analytics.pageView(ANALYTICS_EVENT_KEYS.experiment.tabs.notes.tabView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className='ExperimentNotesTab'>
      <RouteLeavingGuard when={!saveDisabled} />
      <div
        className={classNames('ExperimentNotesTab__Editor', {
          isLoading,
        })}
      >
        <div className='ExperimentNotesTab__Editor__actionPanel'>
          <div className='ExperimentNotesTab__Editor__actionPanel__info'>
            {noteData?.created_at && (
              <Tooltip title='Created at'>
                <div className='ExperimentNotesTab__Editor__actionPanel__info-field'>
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
                <div className='ExperimentNotesTab__Editor__actionPanel__info-field'>
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
                className='ExperimentNotesTab__Editor__actionPanel__saveBtn'
              >
                Save
              </Button>
            </div>
          </Tooltip>
        </div>
        <Editor
          ref={editorRef}
          className='ExperimentNotesTab__Editor__container'
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
          <div className='ExperimentNotesTab__spinnerWrapper'>
            <Spinner />
          </div>
        )}
      </div>
    </section>
  );
}
export default React.memo(ExperimentNotesTab);
