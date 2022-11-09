import React from 'react';

import ContributionsFeed from 'pages/Dashboard/components/ContributionsFeed/ContributionsFeed';
import ProjectContributions from 'pages/Dashboard/components/ProjectContributions/ProjectContributions';

import ExperimentOverviewSidebar from './ExperimentOverviewSidebar';
import { IExperimentOverviewTabProps } from './ExperimentOverviewTab.d';

import './ExperimentOverviewTab.scss';

function ExperimentOverviewTab(
  props: IExperimentOverviewTabProps,
): React.FunctionComponentElement<React.ReactNode> {
  const sidebarRef = React.useRef<HTMLElement | any>(null);
  const overviewSectionRef = React.useRef<HTMLElement | any>(null);
  const overviewSectionContentRef = React.useRef<HTMLElement | any>(null);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);

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
        <ProjectContributions />
        <ContributionsFeed experimentName={props.experimentName} />
      </div>
      <ExperimentOverviewSidebar
        sidebarRef={sidebarRef}
        overviewSectionRef={overviewSectionRef}
        setContainerHeight={setContainerHeight}
        overviewSectionContentRef={overviewSectionContentRef}
      />
    </div>
  );
}
export default ExperimentOverviewTab;
