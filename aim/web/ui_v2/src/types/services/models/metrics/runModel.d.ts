export interface IRun {
  experiment_name: string;
  name: string;
  run_hash: string;
  params: {
    hparams?: IRunParam;
    default?: IRunParam;
    config?: IRunParam;
  };
}

export interface IRunParam {
  [key: string]: any;
}
