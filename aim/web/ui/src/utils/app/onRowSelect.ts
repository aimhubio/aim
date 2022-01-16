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
  key,
  data,
  model,
}: {
  actionType: 'single' | 'selectAll' | 'removeAll';
  key?: string;
  data?: any;
  model: IModel<M>;
}): void {
  const configData = model.getState()?.config;
  if (configData?.table && configData?.table?.selectedRows) {
    let selectedRows = configData.table.selectedRows;
    switch (actionType) {
      case 'single':
        selectedRows = selectedRows.includes(key)
          ? selectedRows.filter((hash: string) => hash !== key)
          : [...selectedRows, key];
        break;
      case 'selectAll':
        if (Array.isArray(data)) {
          const hashArray: string[] = [];
          data.forEach((item: any) => {
            if (!selectedRows.includes(item.selectKey)) {
              hashArray.push(item.selectKey);
            }
          });
          selectedRows = [...selectedRows, ...hashArray];
        } else {
          const hashArray: string[] = [];
          Object.values(data)
            .reduce((acc: any[], value: any) => {
              return acc.concat(value.items);
            }, [])
            .forEach((item: any) => {
              if (!selectedRows.includes(item.selectKey)) {
                hashArray.push(item.selectKey);
              }
            });
          selectedRows = [...selectedRows, ...hashArray];
        }

        break;
      case 'removeAll':
        if (Array.isArray(data)) {
          const hashArray: string[] = data.map((item: any) => item.selectKey);
          selectedRows = selectedRows.filter(
            (hash: string) => !hashArray.includes(hash),
          );
        } else {
          const hashArray: string[] = Object.values(data)
            .reduce((acc: any[], value: any) => {
              return acc.concat(value.items);
            }, [])
            .map((item: any) => item.selectKey);
          selectedRows = selectedRows.filter(
            (hash: string) => !hashArray.includes(hash),
          );
        }

        break;
      default:
        console.log('');
    }

    const table = {
      ...configData.table,
      selectedRows,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({ config });
  }
}
