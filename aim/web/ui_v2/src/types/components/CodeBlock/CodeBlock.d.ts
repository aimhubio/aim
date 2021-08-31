import { Language } from 'prism-react-renderer';

export interface ICodeBlockProps {
  code: string;
  className?: string;
  language?: Language;
}
