export interface IColorPopoverAdvancedProps {
  onPersistenceChange: () => void;
  selectedPersistence: number;
  onPaletteChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
