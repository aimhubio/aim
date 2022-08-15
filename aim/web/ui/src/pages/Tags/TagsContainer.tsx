import React from 'react';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import tagsAppModel from 'services/models/tags/tagsAppModel';
import * as analytics from 'services/analytics';

import Tags from './Tags';

const tagsRequestRef = tagsAppModel.getTagsData();

function TagsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tagsData = useModel(tagsAppModel);

  React.useEffect(() => {
    tagsAppModel.initialize();
    tagsRequestRef.call();
    analytics.pageView(ANALYTICS_EVENT_KEYS.tags.pageView);
  }, []);
  return (
    <ErrorBoundary>
      <Tags
        tagsListData={tagsData?.tagsList}
        isTagsDataLoading={tagsData?.isTagsDataLoading}
        tagInfo={tagsData?.tagInfo}
        tagRuns={tagsData?.tagRuns}
        onNotificationDelete={tagsAppModel.onNotificationDelete}
        notifyData={tagsData?.notifyData}
        isRunsDataLoading={tagsData?.isRunsDataLoading}
        isTagInfoDataLoading={tagsData?.isTagInfoDataLoading}
      />
    </ErrorBoundary>
  );
}

export default TagsContainer;
