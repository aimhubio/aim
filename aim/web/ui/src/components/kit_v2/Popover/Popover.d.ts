import { PopperContentProps } from '@radix-ui/react-popover';

// Interface of the Popover component
export interface IPopoverProps {
  /**
   * Popover content
   */
  content: React.ReactNode | any;
  /** 
    * Trigger element
    @default: <Button>Click me</Button>
    */
  trigger: React.ReactNode | (({ open: boolean }) => React.ReactNode);
  /**
   * popper props
   */
  popperProps?: PopperContentProps;
  /**
    * Popover is default open
    @default: false
    */
  defaultOpen?: boolean;
}
