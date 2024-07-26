import * as React from 'react';

import { IBoxProps } from '../Box';
interface BreadCrumbProps extends IBoxProps {
  /**
   * @description The custom name of the route to be displayed in the breadcrumb.
   * @default undefined
   * @example
   * <Breadcrumb customRouteNames={{ '/projects': 'Projects' }} />
   */
  customRouteValues?: Record<string, string>;
  /**
   * @description The optional data of the routes and their values to be displayed in the breadcrumb.
   * @default undefined
   * @example
   */
  items?: { name: string | React.ReactNode; path: string }[];
}
