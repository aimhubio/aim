import React from 'react';
import { useParams } from 'react-router-dom';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useExperimentData from './useExperimentData';

import './Experiment.scss';

function Experiment(): React.FunctionComponentElement<React.ReactNode> {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { experimentStore } = useExperimentData(experimentId);

  return (
    <ErrorBoundary>
      <section className='Experiment'></section>
    </ErrorBoundary>
  );
}
export default Experiment;
