import { Dispatch, SetStateAction } from 'react';

import { ITagInfo } from 'types/pages/tags/Tags';

export interface ISelectTagProps {
  runHash: string;
  attachedTags: ITagInfo[];
  setAttachedTags: Dispatch<SetStateAction<ITagInfo[]>>;
  onRunsTagsChange?: (runHash: string, tags: ITagInfo[]) => void;
  updatePopover?: (key: string) => void;
}
