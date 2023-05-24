export interface IFeedItemProps {
  date: string;
  data: Array<ContributionType>;
}

export type ContributionType = {
  /**
   * The run name of the contribution
   * @type {string}
   * @example 'My first run'
   */
  name: string;
  /**
   * The  date of the contribution
   * @type {string}
   * @example '2021-01-01 12:00:00'
   */
  date: string;
  /**
   * The run hash of the contribution
   * @type {string}
   * @example '5e9f1b9b-7c1a-4b5a-8f0c-8c1c1b9b7c1a'
   */
  hash: string;
  /**
   * The run active state of the contribution
   * @type {boolean}
   * @example true
   */
  active: boolean;
  /**
   * The run creation time of the contribution
   * @type {number}
   * @example 1610000000
   */
  creation_time: number;
  /**
   * The run experiment name of the contribution
   * @type {string}
   * @example 'My first experiment'
   */
  experiment: string;
  /**
   * The run experiment id of the contribution
   * @type {string}
   * @example '4a4298dd-d144-40d6-9a3c-d5db7a20ee82'
   */
  experimentId: string;
};
