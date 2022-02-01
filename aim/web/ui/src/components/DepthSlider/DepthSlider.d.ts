export interface IDepthSliderProps {
  index: number;
  pathValue: string | string[];
  depth: number;
  onDepthChange: (value: number, index: number) => void;
}
