import React from 'react';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import ExperimentContributions from './ExperimentContributions';
import ExperimentOverviewSidebar from './ExperimentOverviewSidebar';
import ExperimentStatistics from './ExperimentStatistics';
import ExperimentContributionsFeed from './ExperimentContributionsFeed';

import { IExperimentOverviewTabProps } from '.';

import './ExperimentOverviewTab.scss';

function ExperimentOverviewTab(
  props: IExperimentOverviewTabProps,
): React.FunctionComponentElement<React.ReactNode> {
  const sidebarRef = React.useRef<HTMLElement | any>(null);
  const overviewSectionRef = React.useRef<HTMLElement | any>(null);
  const overviewSectionContentRef = React.useRef<HTMLElement | any>(null);
  const [containerHeight, setContainerHeight] = React.useState<number | string>(
    0,
  );

  React.useEffect(() => {
    analytics.pageView(ANALYTICS_EVENT_KEYS.experiment.tabs.overview.tabView);
  }, []);

  function onContainerScroll(e: any) {
    sidebarRef?.current?.scrollTo(0, e.target.scrollTop);
  }

  return (
    <div
      className='ExperimentOverviewTab'
      ref={overviewSectionRef}
      onScroll={onContainerScroll}
    >
      <div
        className='ExperimentOverviewTab__content'
        ref={overviewSectionContentRef}
        style={{ height: containerHeight }}
      >
        <div className='ExperimentOverviewTab__content__section'>
          <ExperimentStatistics experimentName={props.experimentName} />
          <ExperimentContributions
            experimentId={props.experimentId}
            experimentName={props.experimentName}
          />
          <ExperimentContributionsFeed
            experimentId={props.experimentId}
            experimentName={props.experimentName}
          />
        </div>
      </div>
      <ExperimentOverviewSidebar
        sidebarRef={sidebarRef}
        overviewSectionRef={overviewSectionRef}
        setContainerHeight={setContainerHeight}
        overviewSectionContentRef={overviewSectionContentRef}
        description={props.description}
      />
    </div>
  );
}
export default ExperimentOverviewTab;
