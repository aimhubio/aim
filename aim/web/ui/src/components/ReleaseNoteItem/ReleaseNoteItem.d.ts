import React from 'react';

/**
 * @description The IReleaseNoteItemProps interface.
 */
export interface IReleaseNoteItemProps
  extends Partial<React.HTMLProps<HTMLAnchorElement>> {
  /**
   * @description The info of the release note
   * @type string
   * @example '[feat] Add support for new metrics'
   */
  info: string;
  /**
   * @description tag name of the release note
   * @type string
   * @example 'v3.13.0'
   */
  tagName: string;
}
