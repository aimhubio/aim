import * as React from 'react';

import { DOCUMENTATIONS } from 'config/references';

import getBaseExplorerStaticContent, {
  STATIC_CONTENT_TYPES,
} from 'modules/BaseExplorer/utils/getBaseExplorerStaticContent';
import { StaticContentType } from 'modules/BaseExplorer/types';

function getFiguresExplorerStaticContent(
  type: StaticContentType,
): React.ReactNode {
  const illustrationContent = getFiguresExplorerIllustrationContent(type);
  return getBaseExplorerStaticContent(type, illustrationContent);
}

function getFiguresExplorerIllustrationContent(
  type: StaticContentType,
): React.ReactNode {
  const Never_Executed = (
    <>
      It’s super easy to search Aim experiments. Just start typing your query in
      the search bar above.
      <br />
      Look up
      <a
        className='qlAnchor'
        href={DOCUMENTATIONS.EXPLORERS.SEARCH}
        target='_blank'
        rel='noreferrer'
      >
        search docs
      </a>
      to learn more.
    </>
  );
  const Failed = 'Incorrect Query';
  const Insufficient_Resources = "You don't have any tracked figures";
  const Empty = 'No Results';
  const Empty_Bookmarks = "You don't have any saved bookmark";

  const CONTENT = {
    [STATIC_CONTENT_TYPES.Never_Executed]: Never_Executed,
    [STATIC_CONTENT_TYPES.Failed]: Failed,
    [STATIC_CONTENT_TYPES.Insufficient_Resources]: Insufficient_Resources,
    [STATIC_CONTENT_TYPES.Empty]: Empty,
    [STATIC_CONTENT_TYPES.Empty_Bookmarks]: Empty_Bookmarks,
  };
  return CONTENT[type] || null;
}

export default getFiguresExplorerStaticContent;
