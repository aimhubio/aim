import AutocompleteProps from '@material-ui/lab/Autocomplete/Autocomplete';
import { UseAutocompleteProps } from '@material-ui/lab';

export interface ISelectDropdownOption {
  value: string;
  label: string;
  group?: string;
}

export type ISelectDropdownProps<T> = Omit<
  AutocompleteProps<T>,
  'ListboxProps'
> &
  UseAutocompleteProps<T> & {
    selectOptions: T[];
    handleSelect: (option: T) => void;
    selected?: T['value'];
  };
