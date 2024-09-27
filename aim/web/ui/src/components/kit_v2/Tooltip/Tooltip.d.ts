import { TooltipProps, TooltipContentProps } from '@radix-ui/react-tooltip';

export interface ITooltipProps extends TooltipProps {
  /**
   * The duration from when the pointer enters the trigger until the tooltip gets opened.
   * @defaultValue 700
   */
  delayDuration?: number;
  /**
   * How much time a user has to enter another trigger without incurring a delay again.
   * @defaultValue 300
   */
  skipDelayDuration?: number;
  /**
   * When `true`, trying to hover the content will result in the tooltip closing as the pointer leaves the trigger.
   * @defaultValue false
   */
  disableHoverableContent?: boolean;
  /**
   * The content of the tooltip.
   * @defaultValue ''
   * @type React.ReactNode | string | number
   * @example
   * <Tooltip content="Tooltip content">
   */
  content?: React.ReactNode | string | number;
  /**
   * The content props of the tooltip.
   * @defaultValue {}
   */
  contentProps?: TooltipContentProps;
  /**
   * Is the tooltip has arrow
   * @defaultValue false
   * @type boolean
   * @optional
   */
  hasArrow?: boolean;
  /**
   * The color of the tooltip.
   * @defaultValue 'info'
   * @optional
   */
  color?: 'info' | 'success' | 'warning' | 'danger';
}
