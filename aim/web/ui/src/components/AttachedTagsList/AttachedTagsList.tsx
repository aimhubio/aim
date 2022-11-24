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
  inlineAttachedTagsList = false,
}: IAttachedTagsListProps) {
  const [attachedTags, setAttachedTags] = React.useState<ITagInfo[]>(
    tags ?? initialTags ?? [],
  );
  const [, setSelectTagPopoverKey] = React.useState(`${Date.now()}`);
  const getRunInfoRef = React.useRef<any>(null);

  const getRunInfo = React.useCallback((runHash: string): void => {
    getRunInfoRef.current = runsService?.getRunInfo(runHash);
    getRunInfoRef.current.call().then((runInfo: any) => {
      setAttachedTags(runInfo?.props?.tags || []);
    });
  }, []);

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
      return (
        <div className='AttachedTagsList__tags ScrollBar__hidden'>
          {attachedTags.map((tag: ITagInfo) => (
            <Tooltip key={tag.id} title={tag.name}>
              <div className='AttachedTagsList__tags__tagWrapper'>
                <Badge
                  size='xSmall'
                  color={tag.color}
                  label={tag.name}
                  id={tag.id}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      );
    }

    return (
      <div className='AttachedTagsList__noAttachedTags'>
        {inlineAttachedTagsList ? 'Click to edit tags' : 'No attached tags'}
      </div>
    );
  }, [attachedTags, inlineAttachedTagsList]);

  const renderAddTagsButton = React.useCallback(() => {
    return (
      <Button
        withOnlyIcon
        size={addTagButtonSize}
        color='secondary'
        className='AttachedTagsList__ControlPopover__editPopoverButton'
      >
        <Icon name='edit' />
      </Button>
    );
  }, [addTagButtonSize]);

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
            InlineAttachedTagsList: inlineAttachedTagsList,
          })}
        >
          {!inlineAttachedTagsList && renderTagsBadges()}
          <ControlPopover
            title='Tags'
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
              <div
                onClick={onAnchorClick}
                className={`AttachedTagsList__ControlPopover__anchor ${
                  opened ? 'active' : ''
                }`}
              >
                {inlineAttachedTagsList && renderTagsBadges()}
                {!inlineAttachedTagsList && renderAddTagsButton()}
              </div>
            )}
            component={
              <SelectTag
                runHash={runHash}
                attachedTags={attachedTags}
                setAttachedTags={setAttachedTags}
                onRunsTagsChange={onRunsTagsChange}
                updatePopover={setSelectTagPopoverKey}
              />
            }
          />
        </Box>
      </>
    </ErrorBoundary>
  );
}

export default React.memo(AttachedTagsList);
