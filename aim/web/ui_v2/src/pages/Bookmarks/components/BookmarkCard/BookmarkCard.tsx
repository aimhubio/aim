import React from 'react';
import { NavLink } from 'react-router-dom';

import { IBookmarkCardProps } from 'types/pages/bookmarks/components/BookmarkCard';

import './bookmarkCardStyle.scss';

function BookmarkCard({
  name,
  ifLabel,
  selectLabel,
  path,
}: IBookmarkCardProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <NavLink to={path} className='BookMarkCard'>
      <div className='BookMarkCard__top'>
        <span>{name}</span>
      </div>

      <div className='BookMarkCard__bottom'>
        <div>
          <strong>select</strong> {selectLabel}
        </div>
        <div>
          <strong>if</strong> {ifLabel}
        </div>
      </div>
    </NavLink>
  );
}

export default BookmarkCard;
