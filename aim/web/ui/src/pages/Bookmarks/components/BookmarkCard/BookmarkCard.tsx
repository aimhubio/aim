import React from 'react';
import { NavLink } from 'react-router-dom';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Button, Icon, Badge } from 'components/kit';

import COLORS from 'config/colors/colors';
import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';
import * as analytics from 'services/analytics';

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
      return select[type]?.map((val: any) => ({ label: val.label }));
    }, [select]) || [];

  return (
    <div className='BookmarkCard__container'>
      <div className='BookmarkCard__top'>
        <div className='BookmarkCard__title__section'>
          <span className='BookmarkCard__title'>{name}</span>
          <div className='flex fac fjc'>
            <NavLink to={`/${type}/${app_id}`}>
              <Button
                variant='outlined'
                onClick={() =>
                  analytics.trackEvent('[Bookmarks] View bookmark')
                }
              >
                View Bookmark
              </Button>
            </NavLink>
            <span className='BookmarkCard__delete'>
              <Button color='secondary' withOnlyIcon onClick={handleOpenModal}>
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
                return (
                  <Badge
                    size='large'
                    key={tag.label}
                    label={tag.label}
                    color={COLORS[0][index % COLORS[0].length]}
                  />
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
