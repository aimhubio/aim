import { IModel, State } from 'types/services/models/model';
import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

import updateTableSortFields from 'utils/app/updateTableSortFields';
import { getSortedFields, SortField, SortFields } from 'utils/getSortedFields';
/**
 * function onSortChange has 3 major functionalities
 *    1. if only field param passed, the function will change sort option with the following cycle ('asc' -> 'desc' -> none -> 'asc)
 *    2. if value param passed 'asc' or 'desc', the function will replace the sort option of the field in sortFields
 *    3. if value param passed 'none', the function will delete the field from sortFields
 * @param {String} field  - the name of the field (i.e params.dataset.preproc)
 * @param {'asc' | 'desc' | 'none'} order - 'asc' | 'desc' | 'none'
 * @param {String} actionType - the type of the action (i.e DELETE)
 */

export default function onTableSortChange<M extends State>({
  sortFields,
  order,
  index,
  actionType,
  field,
  model,
  appName,
  updateModelData,
}: {
  model: IModel<M>;
  appName: string;
  updateModelData: (
    configData: IAppModelConfig | any,
    shouldURLUpdate?: boolean,
  ) => void;
  order?: 'asc' | 'desc';
  actionType: string;
  field?: SortField;
  index: number;
  sortFields: SortFields;
}) {
  const configData: any | undefined = model.getState()?.config;
  updateTableSortFields({
    sortFields: getSortedFields({
      sortFields: sortFields || configData?.table.sortFields || [],
      order,
      index,
      actionType,
      field,
    }),
    model,
    appName,
    updateModelData,
  });
}
