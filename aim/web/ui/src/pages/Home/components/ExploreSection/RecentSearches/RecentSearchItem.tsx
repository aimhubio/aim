import React from 'react';
import { useHistory } from 'react-router-dom';

import ListItem from 'components/kit/ListItem/ListItem';
import { Icon } from 'components/kit';

import useCodeHighlighter from 'hooks/useCodeHighlighter';

import { BookmarkIconType } from 'pages/Bookmarks/components/BookmarkCard/BookmarkCard';

import { encode } from 'utils/encoder/encoder';

function RecentSearchItem({
  query,
  explorer,
}: {
  query: string;
  explorer: string;
}) {
  const { elementRef } = useCodeHighlighter();
  const history = useHistory();

  const onClick: (e: React.MouseEvent<HTMLElement>) => void = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const search = encode({
        query,
        advancedMode: true,
        advancedQuery: query,
      });
      const path = `/${explorer}?select=${search}`;
      history.push(path);
    },
    [explorer, history, query],
  );
  return (
    <ListItem size='small' onClick={(e) => onClick(e)}>
      <Icon fontSize={12} name={BookmarkIconType[explorer].name} />
      <pre ref={elementRef} data-lang={'python'}>
        {query}
      </pre>
    </ListItem>
  );
}
export default React.memo(RecentSearchItem);
