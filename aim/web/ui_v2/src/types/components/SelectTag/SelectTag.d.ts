import { ITagInfo } from 'types/pages/tags/Tags';

export interface ISelectTagProps {
  tags: ITagInfo[];
  attachedTags: ITagInfo[];
  onSelectTag: (tagId: string) => void;
}
