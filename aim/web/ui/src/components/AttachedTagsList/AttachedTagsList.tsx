import React from 'react';

import { Box, Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Icon, Badge, Text } from 'components/kit';
import SelectTag from 'components/SelectTag/SelectTag';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import runsService from 'services/api/runs/runsService';
import tagsService from 'services/api/tags/tagsService';

import { ITagInfo } from 'types/pages/tags/Tags';
import { IAttachedTagsListProps } from 'types/components/AttachedTagsList/AttachedTagsList';

import './AttachedTagsList.scss';

function AttachedTagsList({
  runHash,
  initialTags,
  headerRenderer,
  onTagsChange,
}: IAttachedTagsListProps) {
  const [tags, setTags] = React.useState<ITagInfo[]>([]);
  const [attachedTags, setAttachedTags] = React.useState<ITagInfo[]>(
    initialTags ?? [],
  );
  const getRunInfoRef = React.useRef<any>(null);
  const getTagsRef = React.useRef<any>(null);
  const createRunsTagRef = React.useRef<any>(null);
  const deleteRunsTagRef = React.useRef<any>(null);

  function getRunInfo(runHash: string): void {
    getRunInfoRef.current = runsService?.getRunInfo(runHash);
    getRunInfoRef.current.call().then((runInfo: any) => {
      setAttachedTags(runInfo?.props?.tags || []);
    });
  }

  function getAllTags(): void {
    getTagsRef.current = tagsService?.getTags();
    getTagsRef.current.call().then((tags: any) => {
      setTags(tags || []);
    });
  }

  function createRunsTag(tag: ITagInfo, run_id: string) {
    createRunsTagRef.current = runsService?.createRunsTag(
      { tag_name: tag.name },
      run_id,
    );
    createRunsTagRef.current
      .call()
      .then()
      .catch((ex: unknown) => {
        setAttachedTags((prevState) => [
          ...prevState.filter((t) => tag.id !== t.id),
        ]);
      });
  }

  function deleteRunsTag(run_id: string, tag: ITagInfo) {
    deleteRunsTagRef.current = runsService?.deleteRunsTag(run_id, tag.id);
    deleteRunsTagRef.current
      .call()
      .then()
      .catch((ex: unknown) => {
        setAttachedTags((prevState) => [...prevState, tag]);
      });
  }

  function onAttachedTagAdd(tag_id: string): void {
    if (!attachedTags.find((tag) => tag.id === tag_id)) {
      const tag = tags.find((tag) => tag.id === tag_id);
      if (tag) {
        setAttachedTags((prevState) => [...prevState, tag]);
        createRunsTag(tag, runHash);
      }
    }
  }

  function onAttachedTagDelete(label: string): void {
    const tag = tags.find((tag) => tag.name === label);
    if (tag) {
      setAttachedTags((prevState) => [
        ...prevState.filter((t) => tag.id !== t.id),
      ]);
      deleteRunsTag(runHash, tag);
    }
  }

  React.useEffect(() => {
    if (runHash) {
      if (!initialTags) {
        getRunInfo(runHash);
      }
      getAllTags();
    }
    return () => {
      getRunInfoRef.current?.abort();
      getTagsRef.current?.abort();
    };
  }, [runHash]);

  React.useEffect(() => {
    if (onTagsChange) {
      onTagsChange(attachedTags);
    }
  }, [attachedTags, onTagsChange]);

  return (
    <ErrorBoundary>
      <div>
        {typeof headerRenderer === 'function' ? (
          headerRenderer(attachedTags?.length)
        ) : (
          <Text className='AttachedTagsList__title'>
            Tags {attachedTags?.length > 0 ? `(${attachedTags.length})` : null}
          </Text>
        )}
        <Box className='AttachedTagsList'>
          {attachedTags?.length > 0 ? (
            <div className='AttachedTagsList__tags ScrollBar__hidden'>
              {attachedTags.map((tag: ITagInfo) => (
                <Badge
                  key={tag.id}
                  color={tag.color}
                  label={tag.name}
                  id={tag.id}
                  onDelete={onAttachedTagDelete}
                />
              ))}
            </div>
          ) : (
            <div className='AttachedTagsList__noAttachedTags'>
              No attached tags
            </div>
          )}
          <ControlPopover
            title='Select Tag'
            titleClassName='AttachedTagsList__ControlPopover__title'
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            anchor={({ onAnchorClick, opened }) => (
              <Tooltip
                title={`${attachedTags?.length > 0 ? 'Select' : 'Attach'} Tag`}
              >
                <div
                  onClick={onAnchorClick}
                  className={`AttachedTagsList__ControlPopover__anchor ${
                    opened ? 'active' : ''
                  }`}
                >
                  {attachedTags?.length > 0 ? (
                    <Button withOnlyIcon size='small' color='secondary'>
                      <Icon name='edit'></Icon>
                    </Button>
                  ) : (
                    <Button
                      size='xSmall'
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
                tags={tags}
                attachedTags={attachedTags}
                onSelectTag={onAttachedTagAdd}
              />
            }
          />
        </Box>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(AttachedTagsList);
