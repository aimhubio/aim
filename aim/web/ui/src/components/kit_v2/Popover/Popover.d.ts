// Interface of the Popover component
export interface IPopoverProps {
  /*
   * Popover content
   */
  content: React.ReactNode | any;
  /*
    * Trigger element
    @default: <Button>Click me</Button>
    */
  trigger: React.ReactNode | (({ open: boolean }) => React.ReactNode);
  /*
    * Popover placement
    @default: 'bottom'
    */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /*
    * Popover content placement offset from trigger (in pixels)
    @example: 10
    @type: number
    @default: 5
    */
  placementOffset?: number;
  /*
    * Popover content placement alignment from trigger (in pixels)
    @example: 'center'
    @type: string
    @default: 'center'
    */
  placementAlign?: 'start' | 'center' | 'end';
  /*
    * Popover is default open
    @default: false
    */
  defaultOpen?: boolean;
}
