import React from 'react';
import { NavLink } from 'react-router-dom';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Button, Icon, Badge, Text } from 'components/kit';
import { IconName } from 'components/kit/Icon';

import COLORS from 'config/colors/colors';

import * as analytics from 'services/analytics';

import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './BookmarkCard.scss';

const BookmarkIconType: { [key: string]: IconName } = {
  images: 'images',
  params: 'params',
  metrics: 'metrics',
  scatters: 'scatterplot',
};

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

  function handleOpenModal(): void {
    setOpenModal(true);
  }
  function handleCloseModal(): void {
    setOpenModal(false);
  }

  function handleBookmarkDelete(): void {
    onBookmarkDelete(id);
  }

  const tags: { label: string }[] = React.useMemo(() => {
    return select[type]?.map((val: any) => ({ label: val.label })) || [];
  }, [select]);

  return (
    <div className='BookmarkCard__container'>
      <div className='BookmarkCard__top'>
        <div className='BookmarkCard__title__section'>
          <div className='BookmarkCard__title__section__container'>
            <Icon name={BookmarkIconType[type]} fontSize={16} />
            <Text size={18} weight={600} component='h3' tint={100}>
              {name}
            </Text>
          </div>
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
        <Text size={12} weight={400} tint={100} component='p'>
          {description}
        </Text>
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
        icon={<Icon fontSize={28} color='#1c2852' name='delete' />}
        title='Are you sure?'
      />
    </div>
  );
}

export default BookmarkCard;
