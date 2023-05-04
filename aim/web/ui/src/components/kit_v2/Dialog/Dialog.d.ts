import { DialogProps } from '@radix-ui/react-dialog';
export interface IDialogProps extends DialogProps {
  /**
   * Dialog title
   * @default ''
   * @optional
   * @type string
   */
  title?: string;
  /**
   * Dialog description
   * @default ''
   * @optional
   * @type string
   */
  description?: string;
  /**
   * dialog confirm callback
   * @default () => {}
   * @optional
   * @type function
   */
  onConfirm?: () => void;
  /**
   * Dialog trigger element
   * @default null
   * @optional
   * @type React.ReactNode
   * @example
   * <Button>Open Dialog</Button>
   */
  trigger?: React.ReactNode;
  /**
   * Dialog title icon
   * @default null
   * @optional
   * @type React.ReactNode
   * @example
   */
  titleIcon?: React.ReactNode;
  /**
   * Dialog children element (content) to be rendered inside the dialog body (below the title and description) and above the footer buttons
   * @default null
   * @optional
   * @type React.ReactNode
   * @example
   * <div>Dialog content</div>
   */
  children?: React.ReactNode;
}
