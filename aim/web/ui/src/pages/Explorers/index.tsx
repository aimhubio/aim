import React from 'react';
import { NavLink } from 'react-router-dom';

import { Box } from 'components/kit_v2';
import { Icon } from 'components/kit';
import { IconName } from 'components/kit/Icon';

import { PathEnum } from 'config/enums/routesEnum';

import { IRoute, explorersRoutes } from 'routes/routes';

import { getItem } from 'utils/storage';

function Explorers(): React.FunctionComponentElement<React.ReactNode> {
  function getPathFromStorage(route: PathEnum): PathEnum | string {
    const path = getItem(`${route.slice(1)}Url`) ?? '';
    if (path !== '' && path.startsWith(route)) {
      return path;
    }
    return route;
  }
  return (
    <Box>
      {Object.values(explorersRoutes).map((route: IRoute, index: number) => {
        const { path, displayName, icon } = route;
        return (
          <Box key={index}>
            <NavLink
              to={() => getPathFromStorage(path)}
              exact={true}
              className='Sidebar__NavLink'
            >
              <li key={path}>
                <Icon fontSize={24} name={icon as IconName} />
                <span>{displayName}</span>
              </li>
            </NavLink>
          </Box>
        );
      })}
    </Box>
  );
}

export default Explorers;
