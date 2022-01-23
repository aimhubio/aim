import _ from 'lodash';

import { IGroupingSelectOption } from 'types/services/models/imagesExplore/imagesExploreAppModel';

export interface SortField extends IGroupingSelectOption {
  readonly?: boolean;
  order: 'asc' | 'desc';
}
export type SortFields = SortField[];

export const SortActionTypes = {
  DELETE: 'DELETE',
  CHANGE: 'CHANGE',
  ORDER_CHANGE: 'ORDER_CHANGE',
  ORDER_TABLE_TRIGGER: 'ORDER_TABLE_TRIGGER',
};

export interface IGetSortedFieldsProps {
  sortFields: SortFields;
  index?: number;
  order?: 'asc' | 'desc';
  actionType: string;
  field?: SortField;
}

export function getSortedFields({
  sortFields,
  index,
  order,
  actionType,
  field,
}: IGetSortedFieldsProps) {
  switch (actionType) {
    case SortActionTypes.DELETE: {
      if (!_.isNil(field)) {
        return sortFields.filter(
          (sortField: SortField) => sortField.value !== field.value,
        );
      }
      return [...sortFields];
    }
    case SortActionTypes.CHANGE: {
      return [...sortFields];
    }
    case SortActionTypes.ORDER_CHANGE: {
      if (!_.isNil(index)) {
        sortFields[index].order = order || 'asc';
      }
      return [...sortFields];
    }
    case SortActionTypes.ORDER_TABLE_TRIGGER: {
      if (index === -1) {
        sortFields.push({
          ...field,
          order: 'asc',
          readonly: false,
        } as SortField);
      } else {
        sortFields[index as number].order =
          sortFields[index as number].order === 'asc' ? 'desc' : 'asc';
      }
      return [...sortFields];
    }
    default:
      return sortFields;
  }
}
