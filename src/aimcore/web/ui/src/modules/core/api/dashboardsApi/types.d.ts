export interface IDashboardRequestBody {
  /**
   * The name of the dashboard
   * @type {string}
   * @example 'My Dashboard'
   */
  name: string;
  /**
   * The description of the dashboard
   * @type string
   * @example 'This is a description'
   */
  description: string;
  /**
   * The app_id which the dashboard belongs to
   * @type {string}
   * @optional
   */
  app_id?: string;
}

export interface IDashboardData {
  /**
   * The app id which the dashboard belongs to
   * @type {string}
   * @example '5e9f1b9b-7c1a-4b5a-8f0c-8c1c1b9b7c1a'
   */
  app_id: string;
  /**
   * The timestamp of the dashboard creation
   * @type {string}
   * @example '2020-01-01T00:00:00.000Z'
   */
  created_at: string;
  /**
   * The id of the dashboard
   * @type {string}
   * @example '5e9f1b9b-7c1a-4b5a-8f0c-8c1c1b9b7c1a'
   */
  id: string;
  /**
   * The name of the dashboard
   * @type {string}
   * @example 'My Dashboard'
   */
  name: string;
  /**
   * The description of the dashboard
   * @type string
   * @example 'This is a description'
   */
  description: string;
  /**
   * The timestamp of the dashboard update
   * @type {string}
   * @example '2020-01-01T00:00:00.000Z'
   */
  updated_at: string;
  /**
   * the app name which the dashboard belongs to
   * @type {string}
   * @example 'metrics'
   */
  app_type: 'metrics' | 'params' | 'images' | 'scatters';
}
