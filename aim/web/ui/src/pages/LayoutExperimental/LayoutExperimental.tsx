import React from 'react';

import { QueryBadge } from 'stories/QueryBadge.stories';

import Button from 'components/kit_v2/Button';
import IconButton from 'components/kit_v2/IconButton';
import ControlsButton from 'components/kit_v2/ControlsButton';
import Popover from 'components/kit_v2/Popover';

import { styled } from 'config/stitches/stitches.config';

const Container = styled('section', {
  display: 'flex',
  p: '$5 $7',
  borderBottom: '1px solid $secondary20',
});

const QueryContainer = styled('div', {
  display: 'flex',
  fd: 'column',
  gap: '$4',
  flex: 1,
});

const QueryContainerTop = styled('div', {
  display: 'flex',
  ai: 'center',
});

const QueryContainerBottom = styled('div', {
  display: 'flex',
  ai: 'center',
});

const ExpressionsList = styled('div', {
  display: 'flex',
  gap: '$3',
  ml: '$5',
});

const SearchContainer = styled('div', {
  display: 'flex',
  fd: 'column',
  gap: '$4',
  pl: '$7',
  borderLeft: '1px solid $secondary20',
});
const SearchContainerButtons = styled('div', {
  display: 'flex',
  ai: 'center',
  jc: 'space-between',
});

const ControlsPanelContainer = styled('div', {
  display: 'flex',
  p: '$3 $7',
  bs: '0px 3px 4px rgba(0, 0, 0, 0.05), 0px 3px 3px rgba(0, 0, 0, 0.08);',
});

const GroupingContainer = styled('div', {
  display: 'flex',
  ai: 'center',
  gap: '$3',
  flex: 1,
});

const GroupingText = styled('span', {
  color: '$textPrimary',
  fontSize: '$2',
  mr: '$2',
});

const ControlsContainer = styled('div', {
  display: 'flex',
  gap: '$3',
});

const PageTopPanel = styled('div', {
  height: '18px',
  bc: '#EAEBEC',
  borderBottom: '1px solid #DCDCDC',
  color: '$textPrimary',
  fontWeight: '$4',
  fontSize: '$2',
  pl: '$7',
  display: 'flex',
  ai: 'center',
});

function LayoutExperimental() {
  return (
    <>
      <PageTopPanel>METRICS EXPLORER</PageTopPanel>
      <Container>
        <QueryContainer>
          <QueryContainerTop>
            <Button size='md' leftIcon='menu'>
              Filter Metrics
            </Button>
            <ExpressionsList>
              <QueryBadge color='primary' size='md'>
                metric.name in loss
              </QueryBadge>
              <QueryBadge color='primary' size='md'>
                metric.context.subset in train, test
              </QueryBadge>
            </ExpressionsList>
          </QueryContainerTop>
          <QueryContainerBottom>
            <Button size='md' leftIcon='plus' variant='text'>
              Add run filter
            </Button>
            <ExpressionsList>
              <QueryBadge size='md'>run.dataset.name {'>'} 0.00001</QueryBadge>
            </ExpressionsList>
          </QueryContainerBottom>
        </QueryContainer>
        <SearchContainer>
          <Button leftIcon='reset' color='success'>
            Update
          </Button>
          <SearchContainerButtons>
            <IconButton icon='edit' color='secondary' variant='text' />
            <IconButton icon='copy' color='secondary' variant='text' />
            <IconButton icon='eye-fill-show' color='secondary' variant='text' />
          </SearchContainerButtons>
        </SearchContainer>
      </Container>
      <ControlsPanelContainer>
        <GroupingContainer>
          <GroupingText>Group by:</GroupingText>
          <Popover
            trigger={({ open }) => (
              <ControlsButton open={open}>Color</ControlsButton>
            )}
            content={<div>Color</div>}
          />
          <Popover
            trigger={({ open }) => (
              <ControlsButton open={open}>Stroke</ControlsButton>
            )}
            content={<div>Color</div>}
          />
          <Popover
            trigger={({ open }) => (
              <ControlsButton
                appliedValuesCount={1}
                open={open}
                rightIcon={{ name: 'eye-fill-show', onClick: () => {} }}
              >
                Chart
              </ControlsButton>
            )}
            content={<div>Color</div>}
          />
        </GroupingContainer>
        <ControlsContainer>
          <Popover
            trigger={({ open }) => (
              <ControlsButton leftIcon='aggregation' open={open}>
                Aggregate
              </ControlsButton>
            )}
            content={<div>Aggregate</div>}
          />
          <Popover
            trigger={({ open }) => (
              <ControlsButton
                leftIcon='ignore-outliers'
                hasAppliedValues
                open={open}
              >
                Ignore Outliers
              </ControlsButton>
            )}
            content={<div>Outliers</div>}
          />
          <Popover
            trigger={({ open }) => (
              <ControlsButton leftIcon='axes-props' open={open}>
                Configure axes
              </ControlsButton>
            )}
            content={<div>Axes Props</div>}
          />
          <Popover
            trigger={({ open }) => (
              <ControlsButton leftIcon='smoothing' open={open}>
                Smoothing
              </ControlsButton>
            )}
            content={<div>Smoothing</div>}
          />
          <Popover
            trigger={({ open }) => (
              <ControlsButton leftIcon='highlight-mode' open={open}>
                Highlight
              </ControlsButton>
            )}
            content={<div>Highlight</div>}
          />
          <Popover
            trigger={({ open }) => (
              <ControlsButton leftIcon='cursor' open={open}>
                Tooltip params
              </ControlsButton>
            )}
            content={<div>Tooltip Params</div>}
          />
        </ControlsContainer>
        <IconButton icon='download' color='secondary' variant='text' />
      </ControlsPanelContainer>
    </>
  );
}

export default LayoutExperimental;
