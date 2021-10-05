import React from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';
import * as analytics from 'services/analytics';
import useModel from 'hooks/model/useModel';
import Grouping from 'pages/Metrics/components/Grouping/Grouping';
import ImagesSet from 'components/ImagesSet/ImagesSet';
import ImagesExploreAppBar from './components/ImagesExploreAppBar/ImagesExploreAppBar';
import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import getStateFromUrl from 'utils/getStateFromUrl';

import './ImagesExplore.scss';

function ImagesExplore(): React.FunctionComponentElement<React.ReactNode> {
  const route = useRouteMatch<any>();
  const location = useLocation();
  const imagesExploreData = useModel<Partial<any>>(imagesExploreAppModel);

  React.useEffect(() => {
    imagesExploreAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = imagesExploreAppModel.getAppConfigData(
        route.params.appId,
      );
      appRequestRef.call().then(() => {
        imagesExploreAppModel.getImagesData().call();
        imagesExploreAppModel.setDefaultAppConfigData();
      });
    } else {
      imagesExploreAppModel.setDefaultAppConfigData();
    }

    const metricsRequestRef = imagesExploreAppModel.getImagesData();
    metricsRequestRef.call();
    analytics.pageView('[ImagesExplorer]');
    return () => {
      metricsRequestRef.abort();
      if (appRequestRef) {
        appRequestRef.abort();
      }
    };
  }, []);

  // Add effect to recover state from URL when browser history navigation is used
  React.useEffect(() => {
    if (!!imagesExploreData?.config) {
      if (
        imagesExploreData.config.grouping !== getStateFromUrl('grouping') ||
        imagesExploreData.config.chart !== getStateFromUrl('chart') ||
        imagesExploreData.config.select !== getStateFromUrl('select')
      ) {
        imagesExploreAppModel.setDefaultAppConfigData();
        imagesExploreAppModel.updateModelData();
      }
    }
  }, [location.search]);

  return (
    <div className='ImagesExplore__container'>
      <section className='ImagesExplore__section'>
        <div className='ImagesExplore__section__div ImagesExplore__fullHeight'>
          <div>
            <ImagesExploreAppBar
              onBookmarkCreate={imagesExploreAppModel.onBookmarkCreate}
              onBookmarkUpdate={imagesExploreAppModel.onBookmarkUpdate}
              onResetConfigData={imagesExploreAppModel.onResetConfigData}
              title={'Images explorer'}
            />
            <Grouping
              groupingData={imagesExploreData?.config?.grouping}
              groupingSelectOptions={imagesExploreData?.groupingSelectOptions}
              onGroupingSelectChange={
                imagesExploreAppModel.onGroupingSelectChange
              }
              onGroupingModeChange={imagesExploreAppModel.onGroupingModeChange}
              onGroupingPaletteChange={() => {}}
              onGroupingReset={() => {}}
              onGroupingApplyChange={() => {}}
              onGroupingPersistenceChange={() => {}}
              onShuffleChange={() => {}}
              singleGrouping
            />
          </div>
          <div>
            {imagesExploreData?.imagesData && (
              <ImagesSet data={imagesExploreData?.imagesData} title={'root'} />
            )}
          </div>
        </div>
      </section>
      {imagesExploreData?.notifyData?.length > 0 && (
        <NotificationContainer
          handleClose={imagesExploreAppModel.onNotificationDelete}
          data={imagesExploreData?.notifyData}
        />
      )}
    </div>
  );
}

export default ImagesExplore;
