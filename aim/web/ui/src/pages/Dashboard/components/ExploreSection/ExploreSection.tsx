import React from 'react';

import { Spinner, Text } from 'components/kit';

import ExperimentsCard from './ExperimentsCard';
import DashboardBookmarks from './DashboardBookmarks/DashboardBookmarks';
import QuickLinks from './QuickLinks/QuickLinks';
import TagsCard from './TagsCard/TagsCard';
import RecentSearches from './RecentSearches/RecentSearches';
import createTagsEngine from './TagsCard/TagsStore';
import createExperimentsEngine from './ExperimentsCard/ExperimentsStore';
import bookmarksEngine from './DashboardBookmarks/DashboardBookmarksStore';

import './ExploreSection.scss';

function ExploreSection(): React.FunctionComponentElement<React.ReactNode> {
  const [loading, setLoading] = React.useState<boolean>(true);
  const { loading: tagsLoading } = React.useRef(
    createTagsEngine,
  ).current.tagsState((state) => state);
  const { loading: experimentsLoading } = React.useRef(
    createExperimentsEngine,
  ).current.experimentsState((state) => state);
  const { loading: bookmarksLoading } = React.useRef(
    bookmarksEngine,
  ).current.dashboardBookmarksState((state) => state);

  React.useEffect(() => {
    // if all resources are loaded
    if (!tagsLoading && !experimentsLoading && !bookmarksLoading) {
      setLoading(false);
    }
  }, [bookmarksLoading, experimentsLoading, tagsLoading]);

  return (
    <aside className='ExploreSection'>
      <Text className='ExploreSection__title' tint={100} size={18} weight={600}>
        Explore
      </Text>
      <QuickLinks />
      <RecentSearches />
      {loading && (
        <div className='ExploreSection__Spinner'>
          <Spinner />
        </div>
      )}
      <div
        className={
          loading ? 'ExploreSection__loading' : 'ExploreSection__content'
        }
      >
        <ExperimentsCard />
        <TagsCard />
        <DashboardBookmarks />
      </div>
    </aside>
  );
}

export default React.memo(ExploreSection);
