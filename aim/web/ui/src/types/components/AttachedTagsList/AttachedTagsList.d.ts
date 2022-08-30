import * as React from 'react';

import { ITagInfo } from 'types/pages/tags/Tags';

export interface IAttachedTagsListProps {
  runHash: string;
  initialTags?: ITagInfo[];
  tags?: ITagInfo[];
  headerRenderer?: (tagsLength: number) => React.ReactNode;
  tableCellMode?: boolean;
  onTagsChange?: (tags: ITagInfo[]) => void;
  onRunsTagsChange?: (runHash: string, tags: ITagInfo[]) => void;
}
