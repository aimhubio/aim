import React from 'react';
import { Button } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import SelectTag from 'components/SelectTag/SelectTag';
import COLORS from 'config/colors/colors';
import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './BookmarkCard.scss';

function BookmarkCard({
  name,
  id,
  app_id,
  description,
  onBookmarkDelete,
  select,
  type,
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

  const tags: { label: string }[] =
    React.useMemo(() => {
      return select.metrics.map((val: any) => ({ label: val.label }));
    }, [select]) || [];

  return (
    <div className='BookmarkCard__container'>
      <div className='BookmarkCard__top'>
        <div className='BookmarkCard__title__section'>
          <span className='BookmarkCard__title'>{name}</span>
          <NavLink to={`/${type}/${app_id}`}>
            <Button size='small' color='primary' variant='contained'>
              View Bookmark
            </Button>
          </NavLink>
        </div>
        <p>{description}</p>
      </div>
      {select.advancedMode ? (
        <div className='BookmarkCard__bottom'>
          <div className='BookmarkCard__run__expression'>
            <CodeBlock code={select.advancedQuery} />
          </div>
        </div>
      ) : (
        <>
          {select.query && (
            <div className='BookmarkCard__bottom'>
              <div className='BookmarkCard__run__expression'>
                <CodeBlock code={select.query} />
              </div>
            </div>
          )}
          {tags.length > 0 && (
            <div className='BookmarkCard__selected__metrics ScrollBar__hidden'>
              {tags.map((tag, index) => {
                let color = COLORS[0][index % COLORS[0].length];
                return (
                  <SelectTag key={tag.label} label={tag.label} color={color} />
                );
              })}
            </div>
          )}
        </>
      )}
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
