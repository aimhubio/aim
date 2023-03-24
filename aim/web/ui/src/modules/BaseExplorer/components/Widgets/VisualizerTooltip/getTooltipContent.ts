import _ from 'lodash-es';
import moment from 'moment';

import { DATE_WITH_SECONDS } from 'config/dates/dates';

import { ITooltipConfig } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import { AimFlatObjectBase, AimFlatObjectBaseRun } from 'types/core/AimObjects';

import { getValue } from 'utils/helper';

function getTooltipContent(
  objectBase: AimFlatObjectBase,
  tooltipConfig: ITooltipConfig,
  foundGroups: Record<string, { fields: object }>,
  renderHeader?: Function,
) {
  let content: {
    selectedProps: Record<string, string | number>;
    selectedGroupingProps: Record<string, object>;
    renderHeader?: Function;
    run?: AimFlatObjectBaseRun;
  } = { selectedProps: {}, selectedGroupingProps: {} };

  if (objectBase) {
    content.run = objectBase.run;

    for (let param of tooltipConfig.selectedFields) {
      const value: string | number = getValue(objectBase, param);
      if (['run.creation_time', 'run.end_time'].indexOf(param) !== -1) {
        content.selectedProps[param] = !_.isNil(value)
          ? moment((value as number) * 1000).format(DATE_WITH_SECONDS)
          : value;
      } else {
        content.selectedProps[param] = value as string;
      }
    }

    if (objectBase.groups) {
      for (let [groupKey, groupsArray] of Object.entries(objectBase.groups)) {
        const groupHash = groupsArray[0];
        const group = foundGroups[groupHash];
        if (group) {
          content.selectedGroupingProps[groupKey] = group.fields;
        }
      }
    }

    if (typeof renderHeader === 'function') {
      content.renderHeader = renderHeader;
    }
  }

  return content;
}

export default getTooltipContent;
