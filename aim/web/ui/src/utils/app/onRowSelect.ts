import _ from 'lodash-es';

import { IModel, State } from 'types/services/models/model';

/**
 *
 * @param {string} key - key of table column
 * @param {any} data - nested data
 * @param {string} actionType - action type name
 * @param {IModel<M extends State>} model - instance of create model
 */

export default function onRowSelect<M extends State>({
  actionType,
  data,
  model,
}: {
  actionType: 'single' | 'selectAll' | 'removeAll';
  data?: any;
  model: IModel<M>;
}): any {
  let selectedRows = model.getState()?.selectedRows || {};
  let rawData =
    model.getState()?.rawData?.reduce((acc: any, item: any) => {
      acc[item.hash] = { runHash: item.hash, ...item.props };
      return acc;
    }, {}) || {};
  switch (actionType) {
    case 'single':
      if (selectedRows[data.selectKey]) {
        selectedRows = _.omit(selectedRows, [data.selectKey]);
      } else {
        selectedRows[data.selectKey] = {
          selectKey: data.selectKey,
          ...rawData[sliceRunHash(data.selectKey)],
        };
      }
      break;
    case 'selectAll':
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (!selectedRows[item.selectKey]) {
            selectedRows[item.selectKey] = {
              selectKey: item.selectKey,
              ...rawData[sliceRunHash(item.selectKey)],
            };
          }
        });
      } else {
        Object.values(data)
          .reduce((acc: any[], value: any) => {
            return acc.concat(value.items);
          }, [])
          .forEach((item: any) => {
            if (!selectedRows[item.selectKey]) {
              selectedRows[item.selectKey] = {
                selectKey: item.selectKey,
                ...rawData[sliceRunHash(item.selectKey)],
              };
            }
          });
      }

      break;
    case 'removeAll':
      if (Array.isArray(data)) {
        const hashArray: string[] = data.map((item: any) => item.selectKey);
        selectedRows = _.omit(selectedRows, hashArray);
      } else {
        const hashArray: string[] = Object.values(data)
          .reduce((acc: any[], value: any) => {
            return acc.concat(value.items);
          }, [])
          .map((item: any) => item.selectKey);
        selectedRows = _.omit(selectedRows, hashArray);
      }

      break;
  }

  model.setState({
    selectedRows: { ...selectedRows },
  });
  return selectedRows;
}

function sliceRunHash(key: string): string {
  return key.slice(0, key.indexOf('/'));
}
