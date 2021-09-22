import React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { Divider, Link } from '@material-ui/core';
import Button from 'components/Button/Button';
import { PathEnum } from 'config/enums/routesEnum';
import { ISelectTagProps } from 'types/components/SelectTag/SelectTag';
import { ITagInfo } from 'types/pages/tags/Tags';
import TagLabel from 'components/TagLabel/TagLabel';

import './SelectTag.scss';

function SelectTag({
  tags,
  attachedTags,
  onSelectTag,
}: ISelectTagProps): JSX.Element {
  const onSelectTagLabel = React.useCallback(
    (e: React.MouseEvent): void => {
      e.currentTarget?.id && onSelectTag?.(e.currentTarget.id);
    },
    [onSelectTag],
  );

  return (
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
                className={`SelectTag__tags__tagLabel ${
                  tagAttached ? 'outlined' : ''
                }`}
              >
                <TagLabel
                  color={tag.color}
                  label={tag.name}
                  id={tag.id}
                  iconName={tagAttached && 'check'}
                  onClick={onSelectTagLabel}
                />
              </div>
            );
          })}
        </div>
      ) : null}
      <Divider className='SelectTag__divider' />
      <div className='SelectTag__createTag__container'>
        <Link to={PathEnum.Tags} component={RouteLink}>
          <Button
            size='medium'
            variant='contained'
            color='primary'
            className='SelectTag__createTag'
          >
            Create Tag
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default React.memo(SelectTag);
