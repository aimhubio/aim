import React from 'react';
import { NavLink } from 'react-router-dom';

import { IExploreCard } from '../ExploreAim/ExploreAim';

import './ExploreAimCard.scss';

function ExploreAimCard({
  title,
  path,
  description,
}: IExploreCard): React.FunctionComponentElement<React.ReactNode> {
  return (
    <NavLink className='ExploreAimCard__container' to={`/${path}`}>
      <div className='ExploreAimCard__icon'>
        <i className={`icon-${path}`} />
      </div>
      <h4 className='ExploreAimCard__title'>{title}</h4>
      <p className='ExploreAimCard__desc'>{description}</p>
      <div className='ExploreAim_card__arrowIcon__container'>
        <i className='icon-arrowRightLong' />
      </div>
    </NavLink>
  );
}

export default React.memo(ExploreAimCard);
