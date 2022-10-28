export interface ITagProps {
  /**
   * @description Tag label
   */
  label: string;
  /**
   * @description Tag color
   * @default 'primary'
   */
  color?: string;
  /**
   * @description Tag size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * @description Tag delete callback
   * @default undefined
   */
  onDelete?: (label: string) => void;
  /**
   * @description Tag disabled state
   * @default false
   * @type boolean
   */
  disabled?: boolean;
  /**
   * @description Whether Tag is monospaced
   * @default false
   * @type boolean
   */
  monospace?: boolean;
}
