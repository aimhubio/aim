import { AppNameEnum } from 'services/models/explorer';

import { IOnGroupingSelectChangeParams } from 'types/services/models/metrics/metricsAppModel';

const icons: { [key: string]: string } = {
  color: 'coloring',
  stroke: 'line-style',
  chart: 'chart-group',
  group: 'image-group',
};

const groupList: any = {
  images: ['group'],
  metrics: ['color', 'stroke', 'chart'],
  params: ['color', 'stroke', 'chart'],
  scatters: ['color', 'chart'],
};
function getColumnOptions(
  grouping: { [key: string]: string[] },
  onGroupingToggle: (params: IOnGroupingSelectChangeParams) => void,
  appName: AppNameEnum,
  field: string,
) {
  return groupList[appName].map((groupName: string) => ({
    value: `${
      grouping?.[groupName]?.includes(field) ? 'un' : ''
    }group by ${groupName}`,
    onClick: () => {
      if (onGroupingToggle) {
        onGroupingToggle({
          groupName,
          list: grouping?.[groupName]?.includes(field)
            ? grouping?.[groupName].filter((item) => item !== field)
            : grouping?.[groupName].concat([field]),
        } as IOnGroupingSelectChangeParams);
      }
    },
    icon: icons[groupName],
  }));
}

export default getColumnOptions;
