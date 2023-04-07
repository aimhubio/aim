import React from 'react';

import { IconSearch } from '@tabler/icons-react';

import AppBar from 'components/AppBar/AppBar';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import { Box, Input, Select, Text } from 'components/kit_v2';

import pageTitlesEnum from 'config/pageTitles/pageTitles';
import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import { IBookmarksProps } from 'types/pages/bookmarks/Bookmarks';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';

import './Bookmarks.scss';

function Bookmarks({
  data,
  onBookmarkDelete,
  isLoading,
  notifyData,
  onNotificationDelete,
}: IBookmarksProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <Box p='$5 $13 0'>
        <Text size='$9' as='h1' weight='$3'>
          Bookmarks
        </Text>
        <Text css={{ mt: '$10', mb: '$16' }} as='p'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt.
        </Text>
        <Box>
          <Input placeholder='Search...' leftIcon={<IconSearch />} />
          <Box>
            <Text>Filter by</Text>
            <Select
              onValueChange={(value) => {}}
              options={[
                {
                  options: [
                    { label: 'Option 1', value: 'option-1' },
                    {
                      label: 'Option 2',
                      value: 'option-2',
                    },
                    {
                      label: 'Option 3',
                      value: 'option-3',
                    },
                    {
                      label: 'Option 4',
                      value: 'option-4',
                    },
                    {
                      label: 'Option 5',
                      value: 'option-5',
                    },
                    { label: 'Option 6', value: 'option-6' },
                    { label: 'Option 7', value: 'option-7' },
                  ],
                },
              ]}
            />
          </Box>
        </Box>
        <Box mt='$5'>
          <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
            {data?.length > 0 &&
              data.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  {...bookmark}
                  onBookmarkDelete={onBookmarkDelete}
                />
              ))}
          </BusyLoaderWrapper>
          {!isLoading && data?.length === 0 ? (
            <IllustrationBlock
              size='xLarge'
              page='bookmarks'
              type={IllustrationsEnum.EmptyBookmarks}
              title={'No Bookmarks Yet'}
            />
          ) : null}
        </Box>
      </Box>
      {notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={onNotificationDelete}
          data={notifyData}
        />
      )}
    </ErrorBoundary>
  );
}

export default Bookmarks;
