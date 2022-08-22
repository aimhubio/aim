import { IButtonProps } from 'components/kit/Button/Button.d';

export interface ISearchButtonProps extends IButtonProps {
  isFetching: boolean;
  onSubmit: () => void;
}
