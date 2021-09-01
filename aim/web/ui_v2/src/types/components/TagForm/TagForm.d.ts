export interface ITagFormProps {
  tagData?: {
    name: string;
    color: string | null;
    description: string | null;
    archived: boolean;
  };
  editMode?: boolean = false;
  tagId?: string;
  updateTagName?: (name: string) => void;
  onCloseModal: () => void;
}
