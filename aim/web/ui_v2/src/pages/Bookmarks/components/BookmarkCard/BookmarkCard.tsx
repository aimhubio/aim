import React from 'react';
import { NavLink } from 'react-router-dom';

import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './bookmarkCardStyle.scss';

function BookmarkCard({
  name,
  app_id,
}: IBookmarkCardProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <NavLink to={`/metrics/${app_id}`} className='BookMarkCard'>
      <div className='BookMarkCard__top'>
        <span>{name}</span>
      </div>

      <div className='BookMarkCard__bottom'>
        <div>
          <strong>select</strong>
        </div>
        <div>
          <strong>if</strong>
        </div>
      </div>
    </NavLink>
  );
}

export default BookmarkCard;
