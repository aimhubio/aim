import React from 'react';
import { useLocation } from 'react-router-dom';

import routes, { IRoute } from 'routes/routes';

import Text from '../Text';
import Box from '../Box';

import { BreadcrumbItem, BreadcrumbLastItem } from './Breadcrumb.style';
import { BreadCrumbProps } from './BreadCrumb.d';
/**
 * @description - Breadcrumb component of the kit. It shows the current location in the app and allows to navigate to the parent pages
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function Breadcrumb({
  customRouteValues,
  ...rest
}: BreadCrumbProps): React.FunctionComponentElement<React.ReactNode> {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x: string) => x);

  return (
    <Box display='flex' ai='center' {...rest}>
      {pathnames?.map((val: string, index: number) => {
        const currentPath = `/${pathnames.slice(0, index + 1).join('/')}`;
        const route = Object.values(routes).find(
          (r: IRoute) => r.path === currentPath,
        );

        const displayName = route
          ? route.displayName
          : customRouteValues?.[currentPath] || val;

        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={currentPath}>
            {isLast ? (
              <BreadcrumbLastItem>{displayName}</BreadcrumbLastItem>
            ) : (
              <BreadcrumbItem
                to={currentPath}
                isActive={(m, location) => {
                  return location.pathname === route?.path;
                }}
              >
                {displayName}
                <Text size='$3' css={{ mx: '$2' }} color='$textPrimary50'>
                  /
                </Text>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

Breadcrumb.displayName = 'BreadCrumb';
export default React.memo(Breadcrumb);
