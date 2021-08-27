export interface IConfirmModalProps {
  open: boolean;
  text: string;
  onSubmit: () => void;
  onCancel: () => void;
}
