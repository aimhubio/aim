export interface IExpressionAutoCompleteProps {
  onExpressionChange: (value: string) => void;
  onSubmit: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | any>,
  ) => void;
  value: string | undefined;
  options: string[];
  isTextArea?: boolean;
  placeholder?: string;
}
