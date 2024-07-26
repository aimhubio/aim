export interface IControlsButtonProps {
  /**
   * @description The button color
   * @example 'neutral'
   * @default 'neutral'
   */
  color?:
    | 'neutral'
    | 'key'
    | 'peach'
    | 'tumbleweed'
    | 'love'
    | 'cobalt'
    | 'skyfall'
    | 'robin'
    | 'leek'
    | 'lime';
  /**
   * @description Popover open state
   * @example false
   */
  open: boolean;
  /**
   * @description Popover has applied values
   * @example false
   * @default false
   */
  hasAppliedValues?: boolean;
  /**
   * @description Control popover triggers applied values count
   * @example 2
   * @default 0
   */
  appliedValuesCount?: number;
  /**
   * @description Control popover trigger right icon props
   * @example { icon: <IconX/>, onClick: () => {} }
   */
  rightIcon?: {
    icon: React.ReactNode;
    onClick: () => void;
  };
  /**
   * @description Control popover trigger left icon
   * @example <IconX/>
   */
  leftIcon?: React.ReactNode;
  /**
   * @description Control popover trigger children
   */
  children: React.ReactNode;
  /**
   * @description Control popover trigger sizes
   * @example 'md'
   */
  size?: 'md' | 'lg' | 'xl';
  /**
   * @description The disabled state of the button
   */
  disabled?: boolean;
}
