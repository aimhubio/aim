import * as React from 'react';
import { ITagInfo } from 'types/pages/tags/Tags';

export interface IAttachedTagsListProps {
  runHash: string;
  initialTags?: ITagInfo[];
  headerRenderer?: (tagsLength: number) => React.ReactNode;
  onTagsChange?: (tags: ITagInfo[]) => void;
}
