import { IBoxProps } from '../Box';

interface BreadCrumbProps extends IBoxProps {
  /**
   * @description The custom name of the route to be displayed in the breadcrumb.
   * @default undefined
   * @example
   * <Breadcrumb customRouteNames={{ '/projects': 'Projects' }} />
   */
  customRouteValues?: Record<string, string>;
}
