import React from 'react';
import { NavLink } from 'react-router-dom';

import Icon from 'components/Icon/Icon';
import { IExploreCard } from '../ExploreAim/ExploreAim';
import { IconName } from 'types/components/Icon/Icon';

import './ExploreAimCard.scss';

function ExploreAimCard({
  title,
  path,
  description,
}: IExploreCard): React.FunctionComponentElement<React.ReactNode> {
  return (
    <NavLink className='ExploreAimCard' to={`/${path}`}>
      <div className='ExploreAimCard__icon'>
        <Icon name={`${path}` as IconName} />
      </div>
      <h4 className='ExploreAimCard__title'>{title}</h4>
      <p className='ExploreAimCard__desc'>{description}</p>
      <div className='ExploreAimCard__arrow__icon'>
        <Icon name='long-arrow-right' />
      </div>
    </NavLink>
  );
}

export default React.memo(ExploreAimCard);
