import React from 'react';
import { NavLink } from 'react-router-dom';

import { IconTrash } from '@tabler/icons-react';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Icon } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import {
  Badge,
  Box,
  Button,
  IconButton,
  Text,
  Tooltip,
} from 'components/kit_v2';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { PathEnum } from 'config/enums/routesEnum';

import * as analytics from 'services/analytics';

import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import { BookmarkCardContainer, CodeBlockWrapper } from './BookmarkCard.style';

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
      <BookmarkCardContainer>
        <Box display='flex' ai='center'>
          <Tooltip content={BookmarkIconType[type].tooltipTitle}>
            <div>
              <Icon box name={BookmarkIconType[type].name} />
            </div>
          </Tooltip>
          <Tooltip content={name}>
            <Text
              truncate
              css={{ ml: '$4', flex: '1' }}
              size='$6'
              weight='$3'
              as='h3'
            >
              {name}
            </Text>
          </Tooltip>
          <NavLink to={`${PathEnum.Explorers}/${type}/${app_id}`}>
            <Button
              variant='outlined'
              onClick={() =>
                analytics.trackEvent(ANALYTICS_EVENT_KEYS.bookmarks.view)
              }
            >
              View Bookmark
            </Button>
          </NavLink>
          <Box as='span' ml='$3'>
            <IconButton
              size='sm'
              variant='ghost'
              icon={<IconTrash />}
              color='secondary'
              onClick={handleOpenModal}
            />
          </Box>
        </Box>
        <Text
          css={{ mt: '$5', wordBreak: 'break-all' }}
          as='p'
          color='#45484D'
          weight='$1'
        >
          {description}
        </Text>
        {(!select.advancedMode && select.query) ||
        (select.advancedMode && select.advancedQuery) ? (
          <CodeBlockWrapper css={{ mt: '$7' }}>
            <CodeBlock
              code={select.advancedMode ? select.advancedQuery : select.query}
            />
          </CodeBlockWrapper>
        ) : null}
        {tags.length && !select.advancedMode ? (
          <Box
            css={{
              mt: '$7',
              display: 'flex',
              gap: '$5',
              overflowX: 'auto',
              p: '1px',
            }}
            className='ScrollBar__hidden'
          >
            {tags.map((tag, index) => {
              return <Badge key={`${tag.label}-${index}`} label={tag.label} />;
            })}
          </Box>
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
      </BookmarkCardContainer>
    </ErrorBoundary>
  );
}

export default BookmarkCard;
