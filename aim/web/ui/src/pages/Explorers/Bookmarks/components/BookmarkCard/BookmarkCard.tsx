import React from 'react';
import { NavLink } from 'react-router-dom';

import { IconTrash } from '@tabler/icons-react';

import CodeBlock from 'components/CodeBlock/CodeBlock';
import { Icon } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import {
  Badge,
  Box,
  Button,
  Dialog,
  IconButton,
  Text,
  Tooltip,
} from 'components/kit_v2';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { PathEnum } from 'config/enums/routesEnum';

import * as analytics from 'services/analytics';

import { IBookmarkCardProps } from './BookmarkCard.d';
import {
  BookmarkCardContainer,
  BookmarkLinkStyled,
  CodeBlockWrapper,
} from './BookmarkCard.style';

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
  select,
  type,
  onBookmarkDelete,
}: IBookmarkCardProps): React.FunctionComponentElement<React.ReactNode> {
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
          <Box display='flex' flex='1 100%'>
            <Tooltip content={BookmarkIconType[type].tooltipTitle}>
              <div>
                <Icon color='#1473E6' box name={BookmarkIconType[type].name} />
              </div>
            </Tooltip>
            <Tooltip content={name}>
              <BookmarkLinkStyled
                onClick={() =>
                  analytics.trackEvent(ANALYTICS_EVENT_KEYS.bookmarks.view)
                }
                to={`${PathEnum.Explorers}/${type}/${app_id}`}
              >
                <Text
                  truncate
                  css={{ ml: '$4', flex: '1' }}
                  size='$6'
                  weight='$3'
                  as='h3'
                  color='$primary'
                >
                  {name}
                </Text>
              </BookmarkLinkStyled>
            </Tooltip>
          </Box>
          <Box as='span' ml='$3'>
            <Dialog
              titleIcon={<IconTrash />}
              title='Delete bookmarks'
              description='Are you sure you want to delete this bookmark?'
              onConfirm={handleBookmarkDelete}
              trigger={
                <IconButton
                  size='md'
                  variant='ghost'
                  color='secondary'
                  icon={<IconTrash />}
                />
              }
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
              code={select.advancedMode ? select.advancedQuery! : select.query!}
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
      </BookmarkCardContainer>
    </ErrorBoundary>
  );
}

export default BookmarkCard;
