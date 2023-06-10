import React from 'react';

export interface IExperimentOverviewSidebarProps {
  sidebarRef: HTMLElement | any;
  overviewSectionRef: React.RefObject<HTMLDivElement>;
  setContainerHeight: (height: number | string) => void;
  overviewSectionContentRef: any;
  description: string;
}
