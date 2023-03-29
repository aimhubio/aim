import React from 'react';
import { NavLink } from 'react-router-dom';

import { Box, Text } from 'components/kit_v2';
import { Icon } from 'components/kit';
import { IconName } from 'components/kit/Icon';

import { PathEnum } from 'config/enums/routesEnum';

import { IRoute, explorersRoutes } from 'routes/routes';

import { getItem } from 'utils/storage';

import { ExplorerCard, ExplorersContainer } from './Explorers.style';

function Explorers(): React.FunctionComponentElement<React.ReactNode> {
  function getPathFromStorage(route: PathEnum): PathEnum | string {
    const path = getItem(`${route.split('/')[2]}Url`) ?? '';
    if (path !== '' && path.startsWith(route)) {
      return path;
    }
    return route;
  }

  return (
    <Box>
      <Text
        css={{ p: '$5 $11', borderBottom: '1px solid $secondary30' }}
        size='$10'
        as='h1'
      >
        Explorers
      </Text>
      <ExplorersContainer>
        {Object.values(explorersRoutes).map((route: IRoute, index: number) => {
          const { path, displayName, icon } = route;
          return (
            <ExplorerCard key={index}>
              <NavLink to={() => getPathFromStorage(path)} exact={true}>
                <Box ai='center' display='flex'>
                  <Icon fontSize={24} name={icon as IconName} />
                  <Text css={{ ml: '$5' }}>{displayName}</Text>
                </Box>
              </NavLink>
            </ExplorerCard>
          );
        })}
      </ExplorersContainer>
    </Box>
  );
}

export default Explorers;
