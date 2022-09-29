import React from 'react';
import { NavLink } from 'react-router-dom';

import { Tooltip } from '@material-ui/core';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Button, Icon, Badge, Text } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './BookmarkCard.scss';

export const BookmarkIconType: {
  [key: string]: { name: IconName; tooltipTitle: string };
} = {
  runs: { name: 'runs', tooltipTitle: 'Runs Explorer' },
  images: { name: 'images', tooltipTitle: 'Images Explorer' },
  params: { name: 'params', tooltipTitle: 'Params Explorer' },
  metrics: { name: 'metrics', tooltipTitle: 'Metrics Explorer' },
  scatters: { name: 'scatterplot', tooltipTitle: 'Scatters Explorer' },
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
    return select?.options?.map((val: any) => ({ label: val.label })) || [];
  }, [select]);

  return (
    <ErrorBoundary>
      <div className='BookmarkCard'>
        <div className='BookmarkCard__top'>
          <div className='BookmarkCard__titleBox__section'>
            <div className='BookmarkCard__titleBox__section__container'>
              <Tooltip
                title={BookmarkIconType[type].tooltipTitle}
                placement='top'
              >
                <div className='BookmarkCard__titleBox__section__container__iconBox'>
                  <Icon name={BookmarkIconType[type].name} fontSize={16} />
                </div>
              </Tooltip>

              <Text
                size={18}
                weight={600}
                component='h3'
                tint={100}
                className='BookmarkCard__titleBox__section__container__title'
              >
                {name}
              </Text>
            </div>

            <div className='BookmarkCard__actionButtonsBox'>
              <NavLink to={`/${type}/${app_id}`}>
                <Button
                  variant='outlined'
                  onClick={() =>
                    analytics.trackEvent(ANALYTICS_EVENT_KEYS.bookmarks.view)
                  }
                >
                  View Bookmark
                </Button>
              </NavLink>
              <span className='BookmarkCard__delete'>
                <Button
                  color='secondary'
                  withOnlyIcon
                  onClick={handleOpenModal}
                >
                  <Icon name='delete' />
                </Button>
              </span>
            </div>
          </div>
          <Text
            size={12}
            weight={400}
            tint={100}
            component='p'
            className='BookmarkCard__description'
          >
            {description}
          </Text>
        </div>
        {tags.length && !select.advancedMode ? (
          <div className='BookmarkCard__selected__metrics ScrollBar__hidden'>
            {tags.map((tag, index) => {
              return (
                <Badge
                  size='large'
                  key={`${tag.label}-${index}`}
                  label={tag.label}
                />
              );
            })}
          </div>
        ) : null}
        {(!select.advancedMode && select.query) ||
        (select.advancedMode && select.advancedQuery) ? (
          <div className='BookmarkCard__bottom'>
            <div className='BookmarkCard__run__expression'>
              <CodeBlock
                code={select.advancedMode ? select.advancedQuery : select.query}
              />
            </div>
          </div>
        ) : null}
        <ConfirmModal
          open={openModal}
          onCancel={handleCloseModal}
          onSubmit={handleBookmarkDelete}
          text='Are you sure you want to delete this bookmark?'
          icon={<Icon name='delete' />}
          title='Delete bookmark'
          statusType='error'
          confirmBtnText='Delete'
        />
      </div>
    </ErrorBoundary>
  );
}

export default BookmarkCard;
