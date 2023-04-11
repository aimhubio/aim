import { TabsProps } from '@radix-ui/react-tabs';

export interface ITabsProps extends TabsProps {
  tabs: TabType[];
}

type TabType = {
  label: string;
  value: string;
  disabled?: boolean;
  content: React.ReactNode | string | any;
};
