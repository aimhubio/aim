import React from 'react';
import { useLocation } from 'react-router-dom';

import routes from 'routes/routes';

import { BreadcrumbItem } from './Breadcrumb.style';

/**
 * @description - Breadcrumb component of the kit. It shows the current location in the app and allows to navigate to the parent pages
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function Breadcrumb(): React.FunctionComponentElement<React.ReactNode> {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x: string) => x);

  return (
    <div className='breadcrumbs'>
      <BreadcrumbItem to='/' activeClassName='active'>
        Home
      </BreadcrumbItem>
      {pathnames.length > 0 && <span className='separator'> / </span>}
      {pathnames?.map((value: string, index: number) => {
        const route = Object.values(routes).find((r) => r.path === `/${value}`);
        if (!route) return null;
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        return (
          <React.Fragment key={route.path}>
            <BreadcrumbItem to={to} activeClassName='active'>
              {route.displayName}
            </BreadcrumbItem>
            {!isLast && <span className='separator'> / </span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default React.memo(Breadcrumb);
