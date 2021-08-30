import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './BookmarkCard.scss';

function BookmarkCard({
  name,
  id,
  app_id,
  description,
  onBookmarkDelete,
}: IBookmarkCardProps): React.FunctionComponentElement<React.ReactNode> {
  const [openModal, setOpenModal] = React.useState<boolean>(false);

  function handleOpenModal() {
    setOpenModal(true);
  }
  function handleCloseModal() {
    setOpenModal(false);
  }

  function handleBookmarkDelete() {
    onBookmarkDelete(id);
  }

  return (
    <div className='BookMarkCard__container'>
      <div className='BookMarkCard__top'>
        <span>{name}</span>
        <span className='BookmarkCard__delete' onClick={handleOpenModal}>
          <i className='icon-delete'></i>
        </span>
        <div>
          <span>{description}</span>
        </div>
      </div>
      <div className='BookMarkCard__bottom'>
        <div>
          <strong>select</strong>
        </div>
        <div>
          <strong>if</strong>
        </div>
      </div>
      <ConfirmModal
        open={openModal}
        onCancel={handleCloseModal}
        onSubmit={handleBookmarkDelete}
        text='Are you sure you want to delete this bookmark?'
      />
    </div>
  );
}

export default BookmarkCard;
