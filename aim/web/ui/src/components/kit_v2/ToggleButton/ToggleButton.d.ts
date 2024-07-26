import { IButtonProps } from '../Button';

export interface IToggleButtonProps {
  /**
   * The size of the button.
   * @default 'md'
   * @example
   * <ToggleButton size="sm" />
   */
  size?: IButtonProps['size'];
  /**
   * The color of the button.
   * @default 'primary'
   * @example
   * <ToggleButton color="secondary" />
   */
  color?: IButtonProps['color'];
  /**
   * The change callback.
   * @example
   * <ToggleButton onChange={handleChange} />
   */
  onChange: (value: string) => void;
  /**
   * The value of the button.
   * @example
   * <ToggleButton value="value" />
   * <ToggleButton value={1} />
   * @type string
   */
  value: string;
  /**
   * left label of the button.
   * @example
   * <ToggleButton leftLabel="left" />
   */
  leftLabel: string;
  /**
   * right label of the button.
   * @example
   * <ToggleButton rightLabel="right" />
   */
  rightLabel: string;
  /**
   * The right value of the button.
   * @example
   * <ToggleButton rightValue="right" />
   */
  rightValue: string;
  /**
   * The left value of the button.
   * @example
   * <ToggleButton leftValue="left" />
   */
  leftValue: string;
  /**
   *  The disabled state of the button.
   *  @example
   * <ToggleButton disabled={true} />
   */
  disabled?: boolean;
}
