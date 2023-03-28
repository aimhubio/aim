import * as Toast from '@radix-ui/react-toast';

import { CSS } from 'config/stitches/types';

export interface IToastProps extends Toast.ToastProps {
  /**
   * @required
   * @description Toast id
   * @example
   * <Toast id={1} />
   * @default
   * */

  id: string | number;
  /**
   * @optional
   * @default {}
   * @description CSS styles
   * @example
   * <Box css={{ color: '$red', backgroundColor: '$blue' }} />
   */
  css?: CSS;
  /**
   * @required
   * @description Toast message
   * @example
   * <Toast message="Hello world" />
   * @default
   * <Toast message="Hello world" />
   * */
  message: string;
  /**
   * @optional
   * @description Toast icon
   * @example
   * <Toast icon={<Icon name="check" />} />
   * @default null
   * */
  icon?: React.ReactNode;
  /**
   * @optional
   * @description Toast delete callback
   * @example
   * <Toast onDelete={(id: string | number) => console.log('deleted')} />
   * @default null
   * */
  onDelete?: (id: string | number) => void;
  /**
   * @optional
   * @description Toast undo callback
   * @example
   * <Toast onUndo={(id?: string | number) => console.log('undone')} />
   * @default null
   * */
  onUndo?: (id?: string | number) => void;
  /**
   * @optional
   * @description Toast status
   * @example
   * <Toast status="success" />
   * @default "info"
   * */
  status?: 'success' | 'danger' | 'warning' | 'info';
}

export interface IToastProviderProps extends Toast.ToastProviderProps {
  /**
   * @description Toast placement
   * @optional
   * @default "bottomRight"
   * @example
   * <ToastProvider placement="topLeft" />
   * @default
   * <ToastProvider placement="bottomRight" />
   * */
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  /**
   * @description Toast css styles
   * @optional
   * @default {}
   * @example
   * <ToastProvider css={{ color: '$red', backgroundColor: '$blue' }} />
   * @default
   * <ToastProvider css={{}} />
   * */
  css?: CSS;
}
