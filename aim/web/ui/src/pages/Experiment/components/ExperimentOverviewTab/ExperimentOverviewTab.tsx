import React from 'react';

import ExperimentContributions from './ExperimentContributions';
import ExperimentOverviewSidebar from './ExperimentOverviewSidebar';
import { IExperimentOverviewTabProps } from './ExperimentOverviewTab.d';
import ExperimentStatistics from './ExperimentStatistics';
import ExperimentContributionsFeed from './ExperimentContributionsFeed';

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
