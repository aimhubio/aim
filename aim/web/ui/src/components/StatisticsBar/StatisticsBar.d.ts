type StatisticsBarItem = {
  percent: number;
  color: string;
  label?: string;
};

export interface IStatisticsBarProps {
  data: Array<StatisticsBarItem>;
  width?: number | string;
  height?: number | string;
}

export interface IBarStyle {
  width: string;
  left: number;
  backgroundColor: string;
}
