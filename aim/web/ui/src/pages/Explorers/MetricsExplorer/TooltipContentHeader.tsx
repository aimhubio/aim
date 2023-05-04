import React from 'react';

import { Text } from 'components/kit';

import { IAxesAlignmentConfig } from 'modules/BaseExplorer/components/Controls/ConfigureAxes';

import { AlignmentOptionsEnum } from 'utils/d3';
import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';
import contextToString from 'utils/contextToString';

function MetricsTooltipContentHeader({
  name,
  context,
  xValue,
  yValue,
  alignmentConfig,
}: {
  name: string;
  context: Record<string, string>;
  yValue: number;
  xValue: number;
  alignmentConfig: IAxesAlignmentConfig;
}) {
  return (
    <div style={{ padding: '0.5rem 1rem' }}>
      <div style={{ display: 'flex', marginTop: '0.4rem' }}>
        <Text>Y: </Text>
        <span style={{ marginLeft: '0.4rem' }}>
          <Text>
            {isSystemMetric(name) ? formatSystemMetricName(name) : name}
          </Text>
          <Text weight={400} style={{ marginLeft: '0.5rem' }}>
            {contextToString(context)}
          </Text>
          <Text component='p' style={{ marginTop: '0.125rem' }}>
            {yValue}
          </Text>
        </span>
      </div>
      <div style={{ display: 'flex', marginTop: '0.4rem' }}>
        <Text>X: </Text>
        <span style={{ marginLeft: '0.4rem' }}>
          <Text weight={400}>{getKeyByAlignment(alignmentConfig)}</Text>
          {alignmentConfig?.type === AlignmentOptionsEnum.CUSTOM_METRIC && (
            <Text weight={400} style={{ marginLeft: '0.5rem' }}>
              {contextToString(context)}
            </Text>
          )}
          <Text component='p' style={{ marginTop: '0.125rem' }}>
            {formatValueByAlignment({
              xAxisTickValue: xValue ?? null,
              type: alignmentConfig?.type,
            })}
          </Text>
        </span>
      </div>
    </div>
  );
}
export default React.memo(MetricsTooltipContentHeader);
