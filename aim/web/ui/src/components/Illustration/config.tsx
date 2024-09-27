import * as React from 'react';

import { ReactComponent as EmptyBookmarks } from 'assets/illustrations/emptyBookmarks.svg';
import { ReactComponent as EmptySearch } from 'assets/illustrations/emptySearch.svg';
import { ReactComponent as ExploreData } from 'assets/illustrations/exploreData.svg';
import { ReactComponent as WrongSearch } from 'assets/illustrations/wrongSearch.svg';

import { DOCUMENTATIONS } from 'config/references';

import { PipelineStatusEnum } from 'modules/core/engine/types';

import { IllustrationType } from '.';

const ILLUSTRATION_TYPES: Record<string, IllustrationType> = {
  Never_Executed: PipelineStatusEnum.Never_Executed,
  Insufficient_Resources: PipelineStatusEnum.Insufficient_Resources,
  Empty: PipelineStatusEnum.Empty,
  Failed: PipelineStatusEnum.Failed,
  Empty_Bookmarks: 'emptyBookmarks',
  Empty_Reports: 'emptyReports',
};

const ILLUSTRATION_LIST: Record<IllustrationType, React.ReactNode> = {
  [ILLUSTRATION_TYPES.Never_Executed]: <ExploreData />,
  [ILLUSTRATION_TYPES.Insufficient_Resources]: <ExploreData />,
  [ILLUSTRATION_TYPES.Empty]: <EmptySearch />,
  [ILLUSTRATION_TYPES.Failed]: <WrongSearch />,
  [ILLUSTRATION_TYPES.Empty_Bookmarks]: <EmptyBookmarks />,
  [ILLUSTRATION_TYPES.Empty_Reports]: <EmptyBookmarks />,
};

function getDefaultIllustrationContent(
  type: IllustrationType = ILLUSTRATION_TYPES.Never_Executed,
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
  const Insufficient_Resources = "You don't have any tracked data";
  const Empty = 'No Results';
  const Empty_Bookmarks = "You don't have any saved bookmark";
  const Empty_Reports = "You don't have any reports created";

  const CONTENT = {
    [ILLUSTRATION_TYPES.Never_Executed]: Never_Executed,
    [ILLUSTRATION_TYPES.Failed]: Failed,
    [ILLUSTRATION_TYPES.Insufficient_Resources]: Insufficient_Resources,
    [ILLUSTRATION_TYPES.Empty]: Empty,
    [ILLUSTRATION_TYPES.Empty_Bookmarks]: Empty_Bookmarks,
    [ILLUSTRATION_TYPES.Empty_Reports]: Empty_Reports,
  };
  return CONTENT[type] || null;
}

export { ILLUSTRATION_TYPES, ILLUSTRATION_LIST, getDefaultIllustrationContent };
