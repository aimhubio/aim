import create from 'zustand';

interface BoardStore {
  editorValue: string;
  consoleOpen: boolean;
  setConsoleOpen: (value: boolean) => void;
  setEditorValue: (value: string) => void;
  destroy: () => void;
}

const useBoardStore = create<BoardStore>((set, get) => ({
  editorValue: '',
  consoleOpen: true,
  setConsoleOpen: (value: boolean) => {
    set({ consoleOpen: value });
  },
  setEditorValue: (value: string) => {
    set({ editorValue: value });
  },
  destroy: () => {
    set({ editorValue: '' });
  },
}));

export default useBoardStore;
