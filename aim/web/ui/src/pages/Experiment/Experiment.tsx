import React from 'react';
import { useParams } from 'react-router-dom';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import useExperimentData from './useExperimentData';
import ExperimentHeader from './components/ExperimentHeader';

import './Experiment.scss';

function Experiment(): React.FunctionComponentElement<React.ReactNode> {
  const { experimentId } = useParams<{ experimentId: string }>();
  const { experimentStore, experimentsStore, getExperimentsData } =
    useExperimentData(experimentId);

  const { data: experimentData, loading: isExperimentLoading } =
    experimentStore;
  const { data: experimentsData, loading: isExperimentsLoading } =
    experimentsStore;
  return (
    <ErrorBoundary>
      <section className='Experiment'>
        <ExperimentHeader
          experimentData={experimentData}
          experimentsData={experimentsData}
          isExperimentLoading={isExperimentLoading}
          isExperimentsLoading={isExperimentsLoading}
          experimentId={experimentId}
          getExperimentsData={getExperimentsData}
        />
        <div style={{ background: 'gray', height: '100%' }}></div>
      </section>
    </ErrorBoundary>
  );
}
export default React.memo(Experiment);
