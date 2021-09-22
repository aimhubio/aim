export interface IFrontProps {
  activityData: IActivityData[];
}

export interface IActivityData {
  activity_map: { [key: string]: number };
  num_experiments: number;
  num_runs: number;
}
