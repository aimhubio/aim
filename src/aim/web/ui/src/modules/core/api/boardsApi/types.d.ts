export interface BoardsRequestBody {
  /**
   * The name of the board
   * @type {string}
   * @example 'My Board'
   */
  name: string;
  /**
   * The description of the board
   * @type string
   * @example 'This is a description'
   */
  description: string;
  /**
   * The template
   * @type {string}
   */
  from_template: string;
  /**
   * The code of the board
   * @type {string}
   */
  code: string;
}

export interface BoardData {
  /**
   * The board_id
   * @type {string}
   * @optional
   */
  board_id: string;
  /**
   * The name of the board
   * @type {string}
   * @example 'My Board'
   */
  name: string;
  /**
   * The description of the board
   * @type string
   * @example 'This is a description'
   */
  description: string;
  /**
   * The template id of the board
   * @type {string}
   */
  template_id: string;
  /**
   * The code of the board
   * @type {string}
   */
  code?: string;
}

export interface TemplateData {
  /**
   * The template_id
   * @type {string}
   */
  template_id: string;
  /**
   * The name of the template
   * @type {string}
   */
  name: string;
  /**
   * The description of the template
   * @type {string}
   */
  description: string;
  /**
   * The package of the template
   * @type {string}
   */
  package: string;
  /**
   * The version of the template
   * @type {string}
   */
  version: string;
}
