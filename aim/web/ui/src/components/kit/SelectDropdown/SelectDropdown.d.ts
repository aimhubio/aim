import { AutocompleteProps } from '@material-ui/lab/Autocomplete/Autocomplete';

export interface ISelectDropdownProps extends AutocompleteProps {
  options: ISelectDropdownOption[];
  handleSelect: (option: ISelectDropdownOption) => void;
  selected?: ISelectDropdownOption['value'];
}

export interface ISelectDropdownOption {
  value: string;
  label: string;
  group?: string;
}
