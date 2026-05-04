import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Tab, Tabs } from '@material-ui/core';

import { TraceType } from 'services/models/runs/types';

import TraceVisualizationContainer from '../TraceVisualizationContainer';
import { ITraceVisualizationContainerProps } from '../types';

import './RunDetailMediaTab.scss';

type MediaTraceType = Extract<TraceType, 'images' | 'videos' | 'audios'>;

type RunDetailMediaTabProps = Pick<
  ITraceVisualizationContainerProps,
  'runHash' | 'traceInfo' | 'runParams'
> & {
  basePath: string;
  initialTraceType?: MediaTraceType;
};

const mediaTabs: { label: string; value: MediaTraceType }[] = [
  { label: 'Images', value: 'images' },
  { label: 'Videos', value: 'videos' },
  { label: 'Audio', value: 'audios' },
];

function isMediaTraceType(value?: string): value is MediaTraceType {
  return value === 'images' || value === 'videos' || value === 'audios';
}

function RunDetailMediaTab({
  basePath,
  initialTraceType = 'images',
  runHash,
  runParams,
  traceInfo,
}: RunDetailMediaTabProps): React.FunctionComponentElement<React.ReactNode> {
  const { pathname } = useLocation();
  const pathParts = pathname.split('/');
  const pathTraceType = pathParts[3] === 'media' ? pathParts[4] : pathParts[3];
  const activeTraceType = isMediaTraceType(pathTraceType)
    ? pathTraceType
    : initialTraceType;

  return (
    <div className='RunDetailMediaTab'>
      <Tabs
        className='RunDetailMediaTab__tabs'
        value={activeTraceType}
        indicatorColor='primary'
        textColor='primary'
      >
        {mediaTabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            component={Link}
            to={`${basePath}/media/${tab.value}`}
          />
        ))}
      </Tabs>
      <div className='RunDetailMediaTab__content'>
        <TraceVisualizationContainer
          key={activeTraceType}
          runHash={runHash}
          traceType={activeTraceType}
          traceInfo={traceInfo}
          runParams={runParams}
        />
      </div>
    </div>
  );
}

RunDetailMediaTab.displayName = 'RunDetailMediaTab';

export default React.memo(RunDetailMediaTab);
