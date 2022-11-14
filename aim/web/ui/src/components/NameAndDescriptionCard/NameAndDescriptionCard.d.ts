export interface INameAndDescriptionCardProps {
  defaultName?: string;
  defaultDescription: string;
  onSave: (name: string, description: string) => void;
}
