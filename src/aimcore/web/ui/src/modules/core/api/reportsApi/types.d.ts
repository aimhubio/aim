/**
 * Reports Props Interface Declaration
 */
export interface ReportsProps {
  /**
   * Report Id
   * @type {string}
   */
  id: string;
  /**
   * Report Name
   * @type {string}
   */
  name: string;
  /**
   * Report Description
   * @type {string}
   */
  description: string;
  /**
   * Report code data
   * @type {string}
   */
  code: string;
  /**
   * Report created date
   * @type {string}
   */
  created_at: string;
  /**
   * Report updated date
   * @type {string}
   */
  updated_at: string;
}

/**
 * Reports request body interface declaration
 * @interface
 */

export interface ReportsRequestBodyProps {
  /**
   * Report Name
   * @type {string}
   */
  name: string;
  /**
   * Report Description
   * @type {string}
   * @optional
   */
  description?: string;
  /**
   * Report code data
   * @type {string}
   * @optional
   */
  code?: string;
}
