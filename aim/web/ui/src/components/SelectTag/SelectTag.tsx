import React from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Divider, Link } from '@material-ui/core';

import { Badge, Button } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { PathEnum } from 'config/enums/routesEnum';

import { ISelectTagProps } from 'types/components/SelectTag/SelectTag';
import { ITagInfo } from 'types/pages/tags/Tags';

import './SelectTag.scss';

function SelectTag({
  tags,
  attachedTags,
  onSelectTag,
}: ISelectTagProps): JSX.Element {
  const onSelectBadge = React.useCallback(
    (e: React.MouseEvent): void => {
      e.currentTarget?.id && onSelectTag?.(e.currentTarget.id);
    },
    [onSelectTag],
  );

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
                    label={tag.name}
                    id={tag.id}
                    startIcon={tagAttached && 'check'}
                    onClick={onSelectBadge}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
        <Divider />
        <div className='SelectTag__createTag__container'>
          <Link to={PathEnum.Tags} component={RouteLink} underline='none'>
            <Button
              size='small'
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
