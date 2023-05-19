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
