import { Button } from '@material-ui/core';
import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import React from 'react';
import { NavLink } from 'react-router-dom';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';

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
    <div className='BookmarkCard__container'>
      <div className='BookmarkCard__top'>
        <div className='BookmarkCard__title__section'>
          <span className='BookmarkCard__title'>{name}</span>
          <NavLink to={`/metrics/${app_id}`}>
            <Button size='small' color='primary' variant='contained'>
              View Bookmark
            </Button>
          </NavLink>
        </div>
        <p>{description}</p>
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
      <span className='BookmarkCard__delete' onClick={handleOpenModal}>
        <DeleteOutlinedIcon />
      </span>
    </div>
  );
}

export default BookmarkCard;
