import React from 'react';
import { useHistory } from 'react-router-dom';

import { Tooltip } from '@material-ui/core';

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

  const onClick: (e: React.MouseEvent<HTMLElement>, newTab?: boolean) => void =
    React.useCallback(
      (e: React.MouseEvent<HTMLElement>, newTab?: boolean) => {
        e.stopPropagation();
        const search = encode({
          query,
          advancedMode: true,
          advancedQuery: query,
        });
        const path = `/${explorer}?select=${search}`;
        if (newTab) {
          window.open(path, '_blank');
          window.focus();
          return;
        }
        history.push(path);
      },
      [explorer, history, query],
    );
  return (
    <Tooltip title={query}>
      <div>
        <ListItem size='small' onClick={(e) => onClick(e)}>
          <Icon fontSize={12} name={BookmarkIconType[explorer].name} />
          <pre ref={elementRef} data-lang={'python'}>
            {query}
          </pre>
          <Icon
            fontSize={12}
            onClick={(e) => onClick(e, true)}
            name='new-tab'
          />
        </ListItem>
      </div>
    </Tooltip>
  );
}
export default React.memo(RecentSearchItem);
