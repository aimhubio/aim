import { IButtonProps } from '../Button';

/**
 * @description QueryBadge component props
 */
export interface IQueryBadgeProps extends IButtonProps {
  /**
   * @description QueryBadge component children
   * @default null
   * @type {React.ReactNode}
   */
  children?: React.ReactNode;
  /**
   * @description QueryBadge component size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * @description QueryBadge component color
   * @default 'primary'
   */
  color?: 'primary' | 'secondary';
  /**
   * @description QueryBadge component disabled state
   * @default false
   * @type boolean
   */
  disabled?: boolean;
}
