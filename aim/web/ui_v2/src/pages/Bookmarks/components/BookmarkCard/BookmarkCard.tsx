import React from 'react';
import { NavLink } from 'react-router-dom';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import Icon from 'components/Icon/Icon';

import Button from 'components/Button/Button';
import COLORS from 'config/colors/colors';
import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';
import TagLabel from 'components/TagLabel/TagLabel';

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
      return select.metrics?.map((val: any) => ({ label: val.label }));
    }, [select]) || [];

  return (
    <div className='BookmarkCard__container'>
      <div className='BookmarkCard__top'>
        <div className='BookmarkCard__title__section'>
          <span className='BookmarkCard__title'>{name}</span>
          <div className='flex fac fjc'>
            <NavLink to={`/${type}/${app_id}`}>
              <Button size='small' variant='outlined'>
                View Bookmark
              </Button>
            </NavLink>
            <span className='BookmarkCard__delete'>
              <Button variant='text' withOnlyIcon onClick={handleOpenModal}>
                <Icon name='delete' />
              </Button>
            </span>
          </div>
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
                  <TagLabel key={tag.label} label={tag.label} color={color} />
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
        icon={<Icon name='delete' />}
        title='Are you sure?'
      />
    </div>
  );
}

export default BookmarkCard;
