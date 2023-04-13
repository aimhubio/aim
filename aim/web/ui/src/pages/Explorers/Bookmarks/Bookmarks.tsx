import React from 'react';

import { IconSearch } from '@tabler/icons-react';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Box, Input, Select, Text } from 'components/kit_v2';
import Breadcrumb from 'components/kit_v2/Breadcrumb';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';
import { TopBar } from 'config/stitches/foundations/layout';

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
      <TopBar>
        <Breadcrumb />
      </TopBar>
      <BusyLoaderWrapper isLoading={isLoading} height={'100vh'}>
        <BookmarksContainerStyled>
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
                <>
                  <Box
                    p='$13'
                    css={{
                      textAlign: 'center',
                      borderBottom: '1px solid $border30',
                    }}
                  >
                    <Text css={{ textAlign: 'center' }} size='$4'>
                      No search results
                    </Text>
                  </Box>
                  {bookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      onBookmarkDelete={onBookmarkDelete}
                      {...bookmark}
                    />
                  ))}
                </>
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
