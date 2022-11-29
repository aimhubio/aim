import * as React from 'react';

import getBaseExplorerStaticContent from 'modules/BaseExplorer/utils/getBaseExplorerStaticContent';
import { StaticContentType } from 'modules/BaseExplorer/types';

import { ILLUSTRATION_TYPES } from 'components/Illustration';

import { DOCUMENTATIONS } from 'config/references';

function getFiguresExplorerStaticContent(
  type?: StaticContentType,
): React.ReactNode {
  return getBaseExplorerStaticContent(
    type,
    getFiguresExplorerIllustrationContent,
  );
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
    [ILLUSTRATION_TYPES.Never_Executed]: Never_Executed,
    [ILLUSTRATION_TYPES.Failed]: Failed,
    [ILLUSTRATION_TYPES.Insufficient_Resources]: Insufficient_Resources,
    [ILLUSTRATION_TYPES.Empty]: Empty,
    [ILLUSTRATION_TYPES.Empty_Bookmarks]: Empty_Bookmarks,
  };
  return CONTENT[type] || null;
}

export default getFiguresExplorerStaticContent;
