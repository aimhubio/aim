import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';
import * as analytics from 'services/analytics';
import './ImagesExplore.scss';
import useModel from 'hooks/model/useModel';
import Grouping from 'pages/Metrics/components/Grouping/Grouping';
import ImagesSet from 'components/ImagesSet/ImagesSet';

function ImagesExplore(): React.FunctionComponentElement<React.ReactNode> {
  const route = useRouteMatch<any>();
  const imagesExploreData = useModel<Partial<any>>(imagesExploreAppModel);
  console.log(imagesExploreData?.config);
  React.useEffect(() => {
    imagesExploreAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<void>;
      abort: () => void;
    };
    // if (route.params.appId) {
    //   appRequestRef = imagesExploreAppModel.getAppConfigData(
    //     route.params.appId,
    //   );
    //   appRequestRef.call().then(() => {
    //     imagesExploreAppModel.getImagesData().call();
    //     // imagesExploreAppModel.setDefaultAppConfigData();
    //   });
    // } else {
    // imagesExploreAppModel.setDefaultAppConfigData();
    // }

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
  return (
    <div className='ImagesExplore__container'>
      <section className='ImagesExplore__section'>
        <div className='ImagesExplore__section__div ImagesExplore__fullHeight'>
          <div>
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
    </div>
  );
}

export default ImagesExplore;
