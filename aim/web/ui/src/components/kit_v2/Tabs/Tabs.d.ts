import React from 'react';

import { TabsProps } from '@radix-ui/react-tabs';

export interface ITabsProps extends TabsProps {
  tabs: TabType[];
}

/**
 * @description The type of the tab
 */
type TabType = {
  /**
   * @description The label of the tab
   * @type {string | JSX.Element}
   * @required
   * @example 'Explorers'
   */
  label: string | JSX.Element;

  labelRightIcon?: JSX.Element;
  /**
   * @description The value of the tab
   * @type {string}
   * @required
   * @example 'explorers'
   */
  value: string;
  /**
   * @description The content of the tab
   * @type {React.ReactNode | string | any}
   * @required
   * @example <div>Content</div>
   */
  content: React.ReactNode | string | any;
  /**
   * @description The disabled state of the tab
   * @type {boolean}
   * @default false
   * @optional
   */
  disabled?: boolean;
};
