export interface ITagFormProps {
  tagData?: { name: string; color: string | null };
  editMode?: boolean = false;
  tagId?: string;
  updateTagName?: (name: string) => void;
}
