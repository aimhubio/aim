import React, { memo, useRef } from 'react';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import { Icon } from 'components/kit';

import tagsAppModel from 'services/models/tags/tagsAppModel';

import { ITagSoftDeleteProps } from 'types/pages/tags/Tags';

import './Tags.scss';

function TagSoftDelete({
  tagInfo,
  tagHash,
  onSoftDeleteModalToggle,
  onTagDetailOverlayToggle,
  isTagDetailOverLayOpened,
  modalIsOpen,
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
    <ConfirmModal
      open={modalIsOpen}
      onCancel={onSoftDeleteModalToggle}
      onSubmit={archivedRef.current?.archived ? onTagShow : onTagHide}
      text={`Are you sure you want to ${
        archivedRef.current?.archived ? 'bring back' : 'hide'
      } this tag?`}
      icon={
        archivedRef.current?.archived ? (
          <Icon name='eye-show-outline' />
        ) : (
          <Icon name='eye-outline-hide' />
        )
      }
      title='Are you sure?'
      confirmBtnText={archivedRef.current?.archived ? 'Bring back' : 'Hide'}
    />
  );
}

export default memo(TagSoftDelete);
