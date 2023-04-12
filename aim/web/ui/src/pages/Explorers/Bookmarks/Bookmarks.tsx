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
import useBookmarksStore from './BookmarksStore';

function Bookmarks(): React.FunctionComponentElement<React.ReactNode> {
  const { bookmarks, isLoading } = useBookmarksStore();
  const getBookmarks = useBookmarksStore((state) => state.getBookmarks);
  const onBookmarkDelete = useBookmarksStore((state) => state.onBookmarkDelete);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [filterValue, setFilterValue] = React.useState<string>('all');

  React.useEffect(() => {
    console.log(bookmarks);
    if (bookmarks.length === 0) {
      getBookmarks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { value } = e.target;
    setSearchValue(value);
  }
  function handleFilterChange(val: string): void {
    setFilterValue(val);
  }

  const filteredBookmarks = React.useMemo(() => {
    const bookmarksList =
      filterValue === 'all' || filterValue === ''
        ? bookmarks
        : bookmarks.filter((bookmark: any) => bookmark.type === filterValue);
    if (searchValue === '') {
      return bookmarksList;
    }

    return bookmarksList.filter((bookmark: any) => {
      return bookmark.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [bookmarks, searchValue, filterValue]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper isLoading={isLoading} height={'100%'}>
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
            {bookmarks?.length > 0 &&
              filteredBookmarks.map((bookmark: any) => (
                <BookmarkCard
                  key={bookmark.id}
                  onBookmarkDelete={onBookmarkDelete}
                  {...bookmark}
                />
              ))}

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
