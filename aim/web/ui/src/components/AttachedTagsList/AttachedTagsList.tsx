import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { Box, Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon, Badge, Text } from 'components/kit';
import SelectTag from 'components/SelectTag/SelectTag';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import runsService from 'services/api/runs/runsService';

import { ITagInfo } from 'types/pages/tags/Tags';
import { IAttachedTagsListProps } from 'types/components/AttachedTagsList/AttachedTagsList';

import './AttachedTagsList.scss';

function AttachedTagsList({
  runHash,
  initialTags,
  tags,
  headerRenderer,
  addTagButtonSize = 'xSmall',
  onTagsChange,
  onRunsTagsChange,
  hasAttachedTagsPopup = false,
}: IAttachedTagsListProps) {
  const [attachedTags, setAttachedTags] = React.useState<ITagInfo[]>(
    tags ?? initialTags ?? [],
  );
  const getRunInfoRef = React.useRef<any>(null);
  const deleteRunsTagRef = React.useRef<any>(null);

  const getRunInfo = React.useCallback((runHash: string): void => {
    getRunInfoRef.current = runsService?.getRunInfo(runHash);
    getRunInfoRef.current.call().then((runInfo: any) => {
      setAttachedTags(runInfo?.props?.tags || []);
    });
  }, []);

  const deleteRunsTag = React.useCallback(
    (run_id: string, tag: ITagInfo): void => {
      deleteRunsTagRef.current = runsService?.deleteRunsTag(run_id, tag.id);
      deleteRunsTagRef.current.call();
    },
    [],
  );

  const onAttachedTagDelete = React.useCallback(
    (label: string): void => {
      const tag = attachedTags.find((tag) => tag.name === label);
      if (tag) {
        const resultTags: ITagInfo[] = attachedTags.filter(
          (t) => tag.id !== t.id,
        );
        setAttachedTags(resultTags);
        deleteRunsTag(runHash, tag);
        onRunsTagsChange && onRunsTagsChange(runHash, resultTags);
      }
    },
    [onRunsTagsChange, attachedTags, deleteRunsTag, runHash],
  );

  React.useEffect(() => {
    if (runHash) {
      if (!initialTags && !tags) {
        getRunInfo(runHash);
      }
    }
    return () => {
      getRunInfoRef.current?.abort();
    };
  }, [runHash, initialTags, getRunInfo, tags]);

  React.useEffect(() => {
    if (tags) {
      setAttachedTags(tags);
    }
  }, [tags]);

  React.useEffect(() => {
    if (onTagsChange) {
      onTagsChange(attachedTags);
    }
  }, [attachedTags, onTagsChange]);

  const renderTagsBadges = React.useCallback(() => {
    if (!_.isEmpty(attachedTags)) {
      if (hasAttachedTagsPopup) {
        return (
          <div className='AttachedTagsList__tags ScrollBar__hidden'>
            <ControlPopover
              title={`Attached Tags (${attachedTags?.length})`}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              anchor={({ onAnchorClick }) => (
                <div
                  className='AttachedTagsList__tags ScrollBar__hidden'
                  onClick={onAnchorClick}
                >
                  {attachedTags.map((tag: ITagInfo) => (
                    <Badge
                      size='xSmall'
                      key={tag.id}
                      color={tag.color}
                      label={tag.name}
                      id={tag.id}
                      onDelete={onAttachedTagDelete}
                    />
                  ))}
                </div>
              )}
              component={
                <div className='InlineAttachedTagsList__tagsContainer'>
                  <div className='InlineAttachedTagsList__tagsContainer__tags'>
                    {attachedTags.map((tag: ITagInfo) => {
                      return (
                        <div
                          key={tag.id}
                          className='InlineAttachedTagsList__tagsContainer__tags__badge'
                        >
                          <Badge
                            size='xSmall'
                            color={tag.color}
                            label={tag.name}
                            id={tag.id}
                            onDelete={onAttachedTagDelete}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              }
            />
          </div>
        );
      }
      return (
        <div className='AttachedTagsList__tags ScrollBar__hidden'>
          {attachedTags.map((tag: ITagInfo) => (
            <Badge
              size='xSmall'
              key={tag.id}
              color={tag.color}
              label={tag.name}
              id={tag.id}
              onDelete={onAttachedTagDelete}
            />
          ))}
        </div>
      );
    }

    return (
      <div className='AttachedTagsList__noAttachedTags'>No attached tags</div>
    );
  }, [attachedTags, onAttachedTagDelete, hasAttachedTagsPopup]);

  return (
    <ErrorBoundary>
      <>
        {typeof headerRenderer === 'function' ? (
          headerRenderer(attachedTags?.length)
        ) : (
          <Text className='AttachedTagsList__title'>
            Tags {!_.isEmpty(attachedTags) ? `(${attachedTags.length})` : null}
          </Text>
        )}
        <Box
          className={classNames('AttachedTagsList', {
            InlineAttachedTagsList: hasAttachedTagsPopup,
          })}
        >
          {renderTagsBadges()}
          <ControlPopover
            title='Select Tag'
            titleClassName='AttachedTagsList__ControlPopover__title'
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            anchor={({ onAnchorClick, opened }) => (
              <Tooltip
                title={`${!_.isEmpty(attachedTags) ? 'Select' : 'Attach'} Tag`}
              >
                <div
                  onClick={onAnchorClick}
                  className={`AttachedTagsList__ControlPopover__anchor ${
                    opened ? 'active' : ''
                  }`}
                >
                  {!_.isEmpty(attachedTags) ? (
                    <Button
                      withOnlyIcon
                      size={addTagButtonSize}
                      color='secondary'
                    >
                      <Icon name='edit'></Icon>
                    </Button>
                  ) : (
                    <Button
                      size={addTagButtonSize}
                      color='primary'
                      variant='outlined'
                      className='AttachedTagsList__ControlPopover__attach'
                    >
                      <Icon name='plus' />
                      <span>Attach</span>
                    </Button>
                  )}
                </div>
              </Tooltip>
            )}
            component={
              <SelectTag
                runHash={runHash}
                attachedTags={attachedTags}
                setAttachedTags={setAttachedTags}
                onRunsTagsChange={onRunsTagsChange}
              />
            }
          />
        </Box>
      </>
    </ErrorBoundary>
  );
}

export default React.memo(AttachedTagsList);
