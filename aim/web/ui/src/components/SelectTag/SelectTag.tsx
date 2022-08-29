import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Divider, Link } from '@material-ui/core';

import { Badge, Button } from 'components/kit';
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
}: ISelectTagProps): JSX.Element {
  const [tags, setTags] = React.useState<ITagInfo[]>([]);
  const getTagsRef = React.useRef<any>(null);
  const createRunsTagRef = React.useRef<any>(null);

  const createRunsTag = React.useCallback(
    (tag: ITagInfo, run_id: string) => {
      createRunsTagRef.current = runsService?.createRunsTag(
        { tag_name: tag.name },
        run_id,
      );
      createRunsTagRef.current
        .call()
        .then()
        .catch((ex: unknown) => {
          setAttachedTags((prevState: ITagInfo[]) => [
            ...prevState.filter((t) => tag.id !== t.id),
          ]);
        });
    },
    [setAttachedTags],
  );

  const onAttachedTagAdd = React.useCallback(
    (e: React.MouseEvent): void => {
      const tag_id = e.currentTarget?.id;
      if (!attachedTags.find((tag) => tag.id === tag_id)) {
        const tag = tags.find((tag) => tag.id === tag_id);
        if (tag) {
          setAttachedTags((prevState) => [...prevState, tag]);
          createRunsTag(tag, runHash);
        }
      }
    },
    [attachedTags, createRunsTag, runHash, setAttachedTags, tags],
  );

  React.useEffect(() => {
    if (runHash) {
      getTagsRef.current = tagsService?.getTags();
      getTagsRef.current.call().then((tags: any) => {
        setTags(tags || []);
      });
    }
    return () => {
      getTagsRef.current?.abort();
    };
  }, [runHash]);

  return (
    <ErrorBoundary>
      <div className='SelectTag'>
        {tags?.length > 0 ? (
          <div className='SelectTag__tags'>
            {tags.map((tag: ITagInfo) => {
              const tagAttached = attachedTags.find(
                (attachedTag) => attachedTag.id === tag.id,
              );
              return (
                <div
                  key={tag.id}
                  className={`SelectTag__tags__badge ${
                    tagAttached ? 'outlined' : ''
                  }`}
                >
                  <Badge
                    color={tag.color}
                    size='xSmall'
                    label={tag.name}
                    id={tag.id}
                    startIcon={tagAttached && 'check'}
                    onClick={onAttachedTagAdd}
                  />
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
