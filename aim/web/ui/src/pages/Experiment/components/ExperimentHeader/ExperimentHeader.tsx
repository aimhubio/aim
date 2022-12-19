import React from 'react';
import classNames from 'classnames';
import { NavLink, useRouteMatch } from 'react-router-dom';
import moment from 'moment';

import { Skeleton } from '@material-ui/lab';
import { Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import ExperimentNavigationPopover from '../ExperimentNavigationPopover';

import { IExperimentHeaderProps } from '.';

import './ExperimentHeader.scss';

function ExperimentHeader({
  isExperimentLoading,
  experimentData,
  isExperimentsLoading,
  experimentsData,
  experimentId,
  getExperimentsData,
}: IExperimentHeaderProps): React.FunctionComponentElement<React.ReactNode> {
  const { url } = useRouteMatch();

  return (
    <ErrorBoundary>
      <div className='ExperimentHeader__headerContainer'>
        <div className='container ExperimentHeader__headerContainer__appBarBox'>
          <div className='ExperimentHeader__headerContainer__appBarBox__navigationContainer'>
            <ControlPopover
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              anchor={({ onAnchorClick, opened }) => (
                <div
                  className='ExperimentHeader__headerContainer__appBarTitleBox'
                  onClick={onAnchorClick}
                >
                  {!isExperimentLoading ? (
                    <>
                      <div className='ExperimentHeader__headerContainer__appBarTitleBox__appBarTitleBoxWrapper'>
                        <Tooltip title={`${experimentData?.name || 'default'}`}>
                          <div className='ExperimentHeader__headerContainer__appBarTitleBox__container'>
                            <Text
                              tint={100}
                              size={16}
                              weight={600}
                              className='ExperimentHeader__headerContainer__appBarTitleBox__title'
                            >
                              {`${experimentData?.name || 'default'}`}
                            </Text>
                          </div>
                        </Tooltip>

                        <Button
                          disabled={isExperimentLoading}
                          color={opened ? 'primary' : 'default'}
                          size='xSmall'
                          className={classNames(
                            'ExperimentHeader__headerContainer__appBarTitleBox__buttonSelectToggler',
                            { opened: opened },
                          )}
                          withOnlyIcon
                        >
                          <Icon name={opened ? 'arrow-up' : 'arrow-down'} />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className='flex'>
                      <Skeleton
                        className='ExperimentHeader__headerContainer__appBarTitleBox__Skeleton'
                        variant='rect'
                        height={24}
                        width={340}
                      />
                      <Skeleton variant='rect' height={24} width={70} />
                    </div>
                  )}
                </div>
              )}
              component={
                <ExperimentNavigationPopover
                  isExperimentsLoading={isExperimentsLoading}
                  experimentsData={experimentsData}
                  experimentId={experimentId}
                  getExperimentsData={getExperimentsData}
                />
              }
            />
            <div className='ExperimentHeader__headerContainer__appBarTitleBox__date'>
              {!isExperimentLoading ? (
                <>
                  <Icon name='calendar' fontSize={12} />
                  <Text size={11} tint={70} weight={400}>
                    {`${moment(
                      (experimentData?.creation_time || 0) * 1000,
                    ).format(DATE_WITH_SECONDS)}`}
                  </Text>
                </>
              ) : (
                <Skeleton
                  className='ExperimentHeader__headerContainer__appBarTitleBox__Skeleton'
                  variant='rect'
                  height={24}
                  width={340}
                />
              )}
            </div>
          </div>
          <div className='ExperimentHeader__headerContainer__appBarBox__actionContainer'>
            <NavLink to={`${url}/settings`}>
              <Button withOnlyIcon size='small' color='secondary'>
                <Icon name='edit' />
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default ExperimentHeader;
