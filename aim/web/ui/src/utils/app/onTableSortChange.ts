import { SortField } from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import updateTableSortFields from 'utils/app/updateTableSortFields';
/**
 * function onSortChange has 3 major functionalities
 *    1. if only field param passed, the function will change sort option with the following cycle ('asc' -> 'desc' -> none -> 'asc)
 *    2. if value param passed 'asc' or 'desc', the function will replace the sort option of the field in sortFields
 *    3. if value param passed 'none', the function will delete the field from sortFields
 * @param {String} field  - the name of the field (i.e params.dataset.preproc)
 * @param {'asc' | 'desc' | 'none'} value - 'asc' | 'desc' | 'none'
 */
export default function onTableSortChange<M extends State>({
  field,
  model,
  appName,
  updateModelData,
  value,
}: {
  field: string;
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
  value?: 'asc' | 'desc' | 'none';
}) {
  const configData = model.getState().config;
  const sortFields = configData?.table.sortFields || [];

  const existField = sortFields?.find((d: SortField) => d[0] === field);
  let newFields: SortField[] = [];

  if (value && existField) {
    if (value === 'none') {
      // delete
      newFields = sortFields?.filter(
        ([name]: SortField) => name !== existField[0],
      );
    } else {
      newFields = sortFields.map(([name, v]: SortField) =>
        name === existField[0] ? [name, value] : [name, v],
      );
    }
  } else {
    if (existField) {
      if (existField[1] === 'asc') {
        // replace to desc
        newFields = sortFields?.map(([name, value]: SortField) => {
          return name === existField[0] ? [name, 'desc'] : [name, value];
        });
      } else {
        // delete field
        newFields = sortFields?.filter(
          ([name]: SortField) => name !== existField[0],
        );
      }
    } else {
      // add field
      newFields = [...sortFields, [field, 'asc']];
    }
  }
  updateTableSortFields({
    sortFields: newFields,
    model,
    appName,
    updateModelData,
  });
}
