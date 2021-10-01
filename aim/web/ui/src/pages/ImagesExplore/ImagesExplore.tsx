import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';
import * as analytics from 'services/analytics';
import './ImagesExplore.scss';
import useModel from 'hooks/model/useModel';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import { ChartTypeEnum } from 'utils/d3';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import ChartLoader from 'components/ChartLoader/ChartLoader';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import Grouping from 'pages/Metrics/components/Grouping/Grouping';

function ImagesExplore(): React.FunctionComponentElement<React.ReactNode> {
  const route = useRouteMatch<any>();
  const imagesExploreData = useModel<Partial<any>>(imagesExploreAppModel);
  console.log(imagesExploreData?.imagesData);
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
              groupingSelectOptions={[]}
              onGroupingSelectChange={() => {}}
              onGroupingModeChange={() => {}}
              onGroupingPaletteChange={() => {}}
              onGroupingReset={() => {}}
              onGroupingApplyChange={() => {}}
              onGroupingPersistenceChange={() => {}}
              singleGrouping
            />
          </div>
          <div
          // ref={props.chartElemRef}
          // className={`Metrics__chart__container${
          //   props.resizeMode === ResizeModeEnum.MaxHeight ? '__hide' : ''
          // }`}
          >
            <BusyLoaderWrapper
              isLoading={false}
              className='Metrics__loader'
              height='100%'
              loaderComponent={<ChartLoader />}
            >
              {!!imagesExploreData?.imagesData?.length ? (
                <ChartPanel
                  key={imagesExploreData?.imagesData?.length}
                  //   ref={props.chartPanelRef}
                  //   panelResizing={props.panelResizing}
                  chartType={ChartTypeEnum.ImageSet}
                  data={imagesExploreData?.imagesData}
                  //   focusedState={props.focusedState}
                  //   tooltip={props.tooltip}
                  //   alignmentConfig={props.alignmentConfig}
                  //   zoom={props.zoom}
                  //   onActivePointChange={props.onActivePointChange}
                  chartProps={[]}
                  // resizeMode={'resizable'}
                  controls={
                    // <Controls
                    //   selectOptions={props.groupingSelectOptions}
                    //   tooltip={props.tooltip}
                    //   smoothingAlgorithm={props.smoothingAlgorithm}
                    //   smoothingFactor={props.smoothingFactor}
                    //   curveInterpolation={props.curveInterpolation}
                    //   ignoreOutliers={props.ignoreOutliers}
                    //   zoom={props.zoom}
                    //   highlightMode={props.highlightMode}
                    //   aggregationConfig={props.aggregationConfig}
                    //   axesScaleType={props.axesScaleType}
                    //   alignmentConfig={props.alignmentConfig}
                    //   onChangeTooltip={props.onChangeTooltip}
                    //   onIgnoreOutliersChange={props.onIgnoreOutliersChange}
                    //   onZoomChange={props.onZoomChange}
                    //   onHighlightModeChange={props.onHighlightModeChange}
                    //   onAxesScaleTypeChange={props.onAxesScaleTypeChange}
                    //   onSmoothingChange={props.onSmoothingChange}
                    //   onAggregationConfigChange={props.onAggregationConfigChange}
                    //   onAlignmentTypeChange={props.onAlignmentTypeChange}
                    //   onAlignmentMetricChange={props.onAlignmentMetricChange}
                    //   projectsDataMetrics={props.projectsDataMetrics}
                    // />
                    <div></div>
                  }
                />
              ) : (
                // !props.requestIsPending && (
                <EmptyComponent
                  size='big'
                  content="It's super easy to search Aim experiments. Lookup search docs to learn more."
                />
                // )
              )}
            </BusyLoaderWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ImagesExplore;
