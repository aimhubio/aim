import React from 'react';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner, Text } from 'components/kit';

import { IExperimentNavigationPopoverProps } from './ExperimentNavigationPopover.d';

import './ExperimentNavigationPopover.scss';

function ExperimentNavigationPopover({
  experimentsData,
  experimentId,
  isExperimentsLoading,
  getExperimentsData,
}: IExperimentNavigationPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const { pathname } = useLocation();

  React.useEffect(() => {
    if (!experimentsData) {
      getExperimentsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <div className='ExperimentNavigationPopover'>
        <div className='ExperimentNavigationPopover__headerContainer'>
          <div className='ExperimentNavigationPopover__headerContainer__titleContainer'>
            <Text size={14} tint={100} weight={700}>
              Experiments
            </Text>
          </div>
        </div>
        <div className='ExperimentNavigationPopover__contentContainer'>
          <div className='ExperimentNavigationPopover__contentContainer__experimentsListContainer'>
            <div className='ExperimentNavigationPopover__contentContainer__experimentsListContainer__experimentList ScrollBar__hidden'>
              {!isExperimentsLoading ? (
                experimentsData?.map((experiment) => (
                  <NavLink
                    key={experiment.id}
                    to={pathname.replace(experimentId, experiment.id)}
                    className={classNames(
                      'ExperimentNavigationPopover__contentContainer__experimentsListContainer__experimentList__experimentContainer',
                      { selected: experimentId === experiment.id },
                    )}
                  >
                    <div className='experimentBox'>
                      <Text
                        size={16}
                        tint={experimentId === experiment.id ? 100 : 80}
                        weight={500}
                        className='experimentBox__experimentName'
                      >
                        {experiment?.name ?? 'default'}
                      </Text>
                    </div>
                  </NavLink>
                ))
              ) : (
                <div className='ExperimentNavigationPopover__loaderContainer'>
                  <Spinner size={34} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default ExperimentNavigationPopover;
