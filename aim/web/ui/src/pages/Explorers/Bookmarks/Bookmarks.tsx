import React from 'react';

import { IconSearch } from '@tabler/icons-react';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Box, Input, Select, Text } from 'components/kit_v2';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import BookmarkCard from './components/BookmarkCard/BookmarkCard';
import {
  BookmarksContainerStyled,
  BookmarksListContainer,
} from './Bookmarks.style';
import useBookmarks from './useBookmarks';

/**
 * @description - Bookmarks component renders list of the saved bookmarks for the user
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function Bookmarks(): React.FunctionComponentElement<React.ReactNode> {
  const {
    bookmarks,
    filteredBookmarks,
    isLoading,
    searchValue,
    filterValue,
    handleSearchChange,
    handleFilterChange,
    onBookmarkDelete,
  } = useBookmarks();

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper isLoading={isLoading} height={'100vh'}>
        <BookmarksContainerStyled>
          <Text weight='$3' as='h3' size='$6'>
            Bookmarks
          </Text>
          <Text css={{ mt: '$5', mb: '$13' }} as='p'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt.
          </Text>
          <Box display='flex' ai='center'>
            <Input
              placeholder='Search...'
              css={{ maxWidth: '394px', width: '100%', mr: '$13' }}
              value={searchValue}
              onChange={handleSearchChange}
              leftIcon={<IconSearch />}
            />
            <Box display='flex' ai='center'>
              <Text css={{ mr: '$5' }}>Filter by</Text>
              <Select
                triggerProps={{ css: { width: '125px' } }}
                onValueChange={handleFilterChange}
                value={filterValue}
                options={[
                  {
                    options: [
                      { label: 'All', value: 'all' },
                      { label: 'Metrics', value: 'metrics' },
                      {
                        label: 'Params',
                        value: 'params',
                      },
                      {
                        label: 'Images',
                        value: 'images',
                      },
                      {
                        label: 'Scatters',
                        value: 'scatters',
                      },
                    ],
                  },
                ]}
              />
            </Box>
          </Box>
          <BookmarksListContainer>
            {bookmarks?.length > 0 ? (
              filteredBookmarks.length > 0 ? (
                filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    onBookmarkDelete={onBookmarkDelete}
                    {...bookmark}
                  />
                ))
              ) : (
                <Box p='$13' css={{ textAlign: 'center' }}>
                  <Text css={{ textAlign: 'center' }} size='$5'>
                    No bookmarks found for the search query...
                  </Text>
                </Box>
              )
            ) : null}
            {!isLoading && bookmarks?.length === 0 ? (
              <IllustrationBlock
                size='xLarge'
                page='bookmarks'
                type={IllustrationsEnum.EmptyBookmarks}
                title={'No Bookmarks Yet'}
              />
            ) : null}
          </BookmarksListContainer>
        </BookmarksContainerStyled>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default Bookmarks;
