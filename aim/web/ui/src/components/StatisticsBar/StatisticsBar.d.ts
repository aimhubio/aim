type StatisticsBarItem = {
  percent: number;
  color: string;
  label?: string;
  highlighted?: boolean;
};

export interface IStatisticsBarProps {
  data: Array<StatisticsBarItem>;
  width?: number | string;
  height?: number | string;
  onMouseOver?: (id: string, source: string) => void;
  onMouseLeave?: () => void;
}

export interface IBarStyle {
  width: string;
  left: number;
  backgroundColor: string;
}
