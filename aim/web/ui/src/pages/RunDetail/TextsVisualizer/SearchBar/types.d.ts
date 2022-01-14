export interface ISearchBarProps {
  matchType: MatchTypes | null;
  searchValue: string;
  isValidInput: boolean;
  onInputChange: (value: string) => void;
  onInputClear: () => void;
  onMatchTypeChange: (value: MatchTypes | null) => void;
}

export interface ISearchInputProps {
  value: string;
  isValidInput: boolean;
  onInputChange: (value: string) => void;
  onInputClear: () => void;
}

export interface ISearchInputEndAdornment {
  showSearchIcon?: boolean;
  onClickClearButton: () => void;
}

export interface UseTextSearchProps {
  rawData: { text: string }[];
  updateData: (data: { text: string }[]) => void;
}

export enum MatchTypes {
  Case = 'case',
  Word = 'word',
  RegExp = 'regExp',
}

export type FilterOptions = {
  matchType: MatchTypes | null;
  searchValue: string;
  isValidSearch: boolean;
};
