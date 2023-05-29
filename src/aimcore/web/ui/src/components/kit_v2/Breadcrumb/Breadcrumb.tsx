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
  items = [],
  ...rest
}: BreadCrumbProps): React.FunctionComponentElement<React.ReactNode> {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x: string) => x);

  function renderBreadcrumb({
    path,
    name,
    isLast,
  }: {
    path: string;
    name: string | React.ReactNode;
    isLast: boolean;
  }) {
    return (
      <React.Fragment key={path}>
        {isLast ? (
          <BreadcrumbLastItem>{name}</BreadcrumbLastItem>
        ) : (
          <BreadcrumbItem
            to={path}
            isActive={(m, location) => {
              return location.pathname === path;
            }}
          >
            {name}
            <Text size='$3' css={{ mx: '$2' }} color='$textPrimary50'>
              /
            </Text>
          </BreadcrumbItem>
        )}
      </React.Fragment>
    );
  }
  return (
    <Box display='flex' ai='center' {...rest}>
      {items.length > 0
        ? items.map((item, index) => {
            const isLast = index === items.length - 1;
            return renderBreadcrumb({ ...item, isLast });
          })
        : pathnames?.map((val: string, index: number) => {
            const currentPath = `/${pathnames.slice(0, index + 1).join('/')}`;
            const route = Object.values(routes).find(
              (r: IRoute) => r.path === currentPath,
            );

            const displayName = route
              ? route.displayName
              : customRouteValues?.[currentPath] || val;

            const isLast = index === pathnames.length - 1;
            return renderBreadcrumb({
              path: currentPath,
              name: displayName,
              isLast,
            });
          })}
    </Box>
  );
}

Breadcrumb.displayName = 'BreadCrumb';
export default React.memo(Breadcrumb);
