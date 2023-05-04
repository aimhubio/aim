export interface INameAndDescriptionCardProps {
  title?: string;
  defaultName?: string;
  defaultDescription: string;
  onSave: (name: string, description: string) => void;
}
