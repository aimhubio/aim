import { SplitProps } from 'react-split';

interface SplitPaneProps extends SplitProps {
  resizing?: boolean;
  useLocalStorage?: boolean;
  sizes: number[]; // initial sizes
}
