import React from 'react';

import { IResourceState } from 'modules/core/utils/createResource';

import contributionsFeedEngine from './ContributionsFeedStore';
function useContributionsFeed() {
  const { current: engine } = React.useRef(contributionsFeedEngine);
  const contributionsFeedStore: IResourceState<any[]> =
    engine.contributionsFeedState((state) => state);
  React.useEffect(() => {
    engine.fetchContributionsFeed();
    return () => {
      engine.contributionsFeedState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    store: contributionsFeedStore,
  };
}

export default useContributionsFeed;
