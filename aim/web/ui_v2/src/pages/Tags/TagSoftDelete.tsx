import React, { memo, useRef, useState } from 'react';
import { Button } from '@material-ui/core';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';

import tagsAppModel from 'services/models/tags/tagsAppModel';
import { ITagSoftDeleteProps } from 'types/pages/tags/Tags';
import './Tags.scss';

function TagSoftDelete({
  tagInfo,
  tagHash,
  onSoftDeleteModalToggle,
  onTagDetailOverlayToggle,
  isTagDetailOverLayOpened,
}: ITagSoftDeleteProps): React.FunctionComponentElement<React.ReactNode> {
  const archivedRef = useRef({ archived: tagInfo?.archived });

  function onTagHide() {
    tagsAppModel.archiveTag(tagHash, !tagInfo?.archived).then(() => {
      tagsAppModel.getTagsData().call();
      onSoftDeleteModalToggle();
      isTagDetailOverLayOpened && onTagDetailOverlayToggle();
    });
  }

  function onTagShow() {
    tagsAppModel.archiveTag(tagHash, !tagInfo?.archived).then(() => {
      tagsAppModel.getTagsData().call();
      onSoftDeleteModalToggle();
      isTagDetailOverLayOpened && onTagDetailOverlayToggle();
    });
  }

  return (
    <div className='TagSoftDelete'>
      <div className='TagSoftDelete__contentContainer'>
        <div className='TagSoftDelete__contentContainer__iconContainer'>
          {archivedRef.current?.archived ? (
            <VisibilityIcon
              className='TagSoftDelete__contentContainer__iconContainer__icon'
              fontSize='large'
            />
          ) : (
            <VisibilityOffIcon
              className='TagSoftDelete__contentContainer__iconContainer__icon'
              fontSize='large'
            />
          )}
        </div>
        <div className='TagSoftDelete__contentContainer__textBox'>
          <p className='TagSoftDelete__contentContainer__textBox__titleText'>
            Are you sure?
          </p>
          <p className='TagSoftDelete__contentContainer__textBox__contentText'>{`Are you sure you want to ${
            archivedRef.current?.archived ? 'bring back' : 'hide'
          } this tag?`}</p>
        </div>
      </div>
      <div className='TagSoftDelete__footerBox'>
        <Button
          onClick={onSoftDeleteModalToggle}
          className='TagSoftDelete__footerBox__cancelButton'
        >
          Cancel
        </Button>
        {archivedRef.current?.archived ? (
          <Button onClick={onTagShow} variant='contained' color='primary'>
            Bring back
          </Button>
        ) : (
          <Button onClick={onTagHide} variant='contained' color='primary'>
            Hide
          </Button>
        )}
      </div>
    </div>
  );
}

export default memo(TagSoftDelete);
