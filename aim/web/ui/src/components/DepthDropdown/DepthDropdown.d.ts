export interface IDepthDropdownProps {
  index: number;
  pathValue: string | string[];
  depth: number;
  onDepthChange: (value: number, index: number) => void;
}
