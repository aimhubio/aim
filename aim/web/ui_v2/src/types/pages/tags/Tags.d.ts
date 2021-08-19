export interface ITagsProps {
  tagsList: ITagProps[];
}

export interface ITagProps {
  name: string;
  color: string | null;
  id: string;
  run_count: number;
}
