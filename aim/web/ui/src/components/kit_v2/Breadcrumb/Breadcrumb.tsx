import React from 'react';
import { useLocation } from 'react-router-dom';

import routes, { IRoute } from 'routes/routes';

import Text from '../Text';
import Box from '../Box';

import { BreadcrumbItem } from './Breadcrumb.style';

/**
 * @description - Breadcrumb component of the kit. It shows the current location in the app and allows to navigate to the parent pages
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function Breadcrumb(): React.FunctionComponentElement<React.ReactNode> {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x: string) => x);

  return (
    <Box display='flex' ai='center'>
      {pathnames?.map((v: string, index: number) => {
        const currentPath = `/${pathnames.slice(0, index + 1).join('/')}`;
        const route = Object.values(routes).find(
          (r: IRoute) => r.path === currentPath,
        );
        if (!route) return null;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={route.path}>
            <BreadcrumbItem
              to={currentPath}
              isActive={(m, location) => {
                return location.pathname === route.path;
              }}
            >
              {route.displayName}
            </BreadcrumbItem>
            {!isLast && (
              <Text size='$3' css={{ mx: '$2' }} color='$textPrimary50'>
                {' '}
                /{' '}
              </Text>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

Breadcrumb.displayName = 'BreadCrumb';
export default React.memo(Breadcrumb);
