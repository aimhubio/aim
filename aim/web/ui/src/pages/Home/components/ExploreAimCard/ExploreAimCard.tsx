import React from 'react';
import { NavLink } from 'react-router-dom';

import { Icon, Text } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IExploreCard } from '../ExploreAim/ExploreAim';

import './ExploreAimCard.scss';

function ExploreAimCard({
  title,
  path,
  description,
  icon,
}: IExploreCard): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <NavLink className='ExploreAimCard' to={`/${path}`}>
        <div className='ExploreAimCard__icon'>
          <Icon name={`${icon}` as IconName} />
        </div>
        <Text
          component='h4'
          weight={600}
          size={16}
          className='ExploreAimCard__title'
          tint={100}
        >
          {title}
        </Text>
        <Text
          component='span'
          weight={400}
          size={14}
          className='ExploreAimCard__desc'
          tint={100}
        >
          {description}
        </Text>
        <div className='ExploreAimCard__arrow__icon'>
          <Icon name='long-arrow-right' />
        </div>
      </NavLink>
    </ErrorBoundary>
  );
}

export default React.memo(ExploreAimCard);
