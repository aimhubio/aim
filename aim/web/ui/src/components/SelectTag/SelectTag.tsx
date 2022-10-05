import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import classNames from 'classnames';

import { Divider, Link } from '@material-ui/core';

import { Text, Button, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';

import tagsService from 'services/api/tags/tagsService';
import runsService from 'services/api/runs/runsService';

import { ISelectTagProps } from 'types/components/SelectTag/SelectTag';
import { ITagInfo } from 'types/pages/tags/Tags';

import './SelectTag.scss';

function SelectTag({
  runHash,
  attachedTags,
  setAttachedTags,
  onRunsTagsChange,
}: ISelectTagProps): JSX.Element {
  const [tags, setTags] = React.useState<ITagInfo[]>([]);
  const getTagsRef = React.useRef<any>(null);
  const attachTagToRunRef = React.useRef<any>(null);
  const deleteRunsTagRef = React.useRef<any>(null);

  const deleteRunsTag = React.useCallback(
    (run_id: string, tag: ITagInfo): void => {
      deleteRunsTagRef.current = runsService?.deleteRunsTag(run_id, tag.id);
      deleteRunsTagRef.current.call();
    },
    [],
  );

  const onAttachedTagDelete = React.useCallback(
    (e): void => {
      const tag_id = e.currentTarget?.id;
      const tag = attachedTags.find((tag) => tag.id === tag_id);
      if (tag) {
        const resultTags: ITagInfo[] = attachedTags.filter(
          (t) => tag.id !== t.id,
        );
        setAttachedTags(resultTags);
        deleteRunsTag(runHash, tag);
        onRunsTagsChange && onRunsTagsChange(runHash, resultTags);
      }
    },
    [onRunsTagsChange, setAttachedTags, attachedTags, deleteRunsTag, runHash],
  );

  const attachTagToRun = React.useCallback((tag: ITagInfo, run_id: string) => {
    attachTagToRunRef.current = runsService?.attachRunsTag(
      { tag_name: tag.name },
      run_id,
    );
    attachTagToRunRef.current.call();
  }, []);

  const onAttachedTagAdd = React.useCallback(
    (e: React.MouseEvent): void => {
      const tag_id = e.currentTarget?.id;
      if (!attachedTags.find((tag) => tag.id === tag_id)) {
        const tag = tags.find((tag) => tag.id === tag_id);
        if (tag) {
          setAttachedTags((prevState) => [...prevState, tag]);
          attachTagToRun(tag, runHash);
          onRunsTagsChange && onRunsTagsChange(runHash, [...attachedTags, tag]);
        }
      }
    },
    [
      attachedTags,
      attachTagToRun,
      runHash,
      setAttachedTags,
      tags,
      onRunsTagsChange,
    ],
  );

  React.useEffect(() => {
    if (runHash) {
      getTagsRef.current = tagsService?.getTags();
      getTagsRef.current.call().then((tags: any) => {
        setTags(tags || []);
      });
    }
  }, [runHash]);

  React.useEffect(() => {
    return () => {
      getTagsRef.current?.abort();
      attachTagToRunRef.current?.abort();
      deleteRunsTagRef.current?.abort();
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className='SelectTag'>
        {tags?.length > 0 ? (
          <div className='SelectTag__tags ScrollBar__hidden'>
            {tags.map((tag: ITagInfo) => {
              const tagAttached = attachedTags.find(
                (attachedTag) => attachedTag.id === tag.id,
              );
              return (
                <div
                  key={tag.id}
                  className='SelectTag__tags__item'
                  id={tag.id}
                  onClick={(e) =>
                    tagAttached ? onAttachedTagDelete(e) : onAttachedTagAdd(e)
                  }
                >
                  {tagAttached && (
                    <Icon
                      name='check'
                      className='SelectTag__tags__item__checkedIcon'
                      fontSize={12}
                    />
                  )}
                  <div className='SelectTag__tags__item__content'>
                    <div className='SelectTag__tags__item__content__nameWrapper'>
                      <span
                        className='SelectTag__tags__item__content__nameWrapper__colorBadge'
                        style={{ background: tag.color }}
                      />
                      <Text
                        className='SelectTag__tags__item__content__nameWrapper__name'
                        size={12}
                        weight={500}
                      >
                        {tag.name}
                      </Text>
                    </div>
                    <Text
                      className='SelectTag__tags__item__content__description'
                      size={10}
                      tint={60}
                      weight={500}
                    >
                      {tag.description}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <></>
        )}
        <Divider />
        <div className='SelectTag__createTag__container'>
          <Link to={PathEnum.Tags} component={RouteLink} underline='none'>
            <Button
              size='xSmall'
              variant='contained'
              color='primary'
              className='SelectTag__createTag'
            >
              Create Tag
            </Button>
          </Link>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SelectTag);
