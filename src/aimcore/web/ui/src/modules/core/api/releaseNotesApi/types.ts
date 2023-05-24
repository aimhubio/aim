/**
 * @description This interface is used for the release notes data. It is used for the release notes list and the release note details.
 */
export interface IReleaseNote {
  /**
   * @description The url of the release note with the release note id.
   * @type {string}
   * @example 'https://api.github.com/repos/aimhubio/aim/releases/76800801'
   */
  url: string;
  /**
   * @description The asset url of the release note.
   * @type {string}
   */
  assets_url: string;
  /**
   * @description The upload url of the release note.
   * @type {string}
   */
  upload_url: string;
  /**
   * @description The page/html url of the release note.
   * @type {string}
   */
  html_url: string;
  /**
   * @description The id of the release note.
   * @type {number}
   * @example 76800801
   */
  id: number;
  /**
   * @description The author data of the release note.
   * @type {IReleaseNoteAuthor}
   */
  author: ReleaseNoteAuthorType;
  /**
   * @description The node_id of the release note.
   * @type {string}
   * @example 'RE_kwDOC02th84Ek-Mh'
   */
  node_id: string;
  /**
   * @description The tag name of the release note.
   * @type {string}
   * @example 'v3.13.0'
   */
  tag_name: string;
  /**
   * @description The target of the commit of the release.
   * @type string
   * @example 'main'
   */
  target_commitish: string;
  /**
   * @description The name of the release.
   * @type string
   * @example 'v3.13.0 🚀'
   */
  name: string;
  /**
   * @description The draft status of the release.
   * @type boolean
   * @example false
   */
  draft: boolean;
  /**
   * @description The prerelease status of the release.
   * @type boolean
   * @example false
   */
  prerelease: boolean;
  /**
   * @description The created at timestamp of the release.
   * @type string
   * @example '2022-09-10T15:25:48Z'
   */
  created_at: string;
  /**
   * @description The published at timestamp of the release.
   * @type string
   * @example '2022-09-10T15:57:10Z'
   */
  published_at: string;
  /**
   * @description The assets of the release.
   */
  assets: [];
  /**
   * @description The gzip file download url of that version of aim.
   * @type string
   */
  tarball_url: string;
  /**
   * @description The zip file download url of that version of aim.
   * @type string
   */
  zipball_url: string;
  /**
   * @description The markdown type body of the release.
   * @type string
   * @example '## Features'
   */
  body: string;
  /**
   * @description The contributors of the release.
   * @type number
   * @example 3
   */
  mentions_count: number;
}

/**
 * @description The type for the release notes author data
 */
export type ReleaseNoteAuthorType = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
};
