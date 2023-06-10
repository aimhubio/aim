import { IIconProps } from 'components/kit/Icon';

export interface IDropdownProps {
  placeholder?: string;
  value?: string | null;
  options:
    | OptionsOrGroups<{ value: string; label: string }>
    | { value: string; label: string }[];
  size?: 'small' | 'medium' | 'large';
  open?: boolean;
  withPortal?: true;
  className?: string;
  selectClassName?: string;
  label?: string;
  maxMenuListHeight?: string;
  isColored?: boolean;
  isDisabled?: boolean;
  isClearable?: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
  onChange: (value: { value: string; label: string } | null) => void;
  icon?: IIconProps;
}
