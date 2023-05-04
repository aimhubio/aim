import create from 'zustand';

interface BoardStore {
  editorValue: string;
  setEditorValue: (value: string) => void;
  destroy: () => void;
}

const useBoardStore = create<BoardStore>((set, get) => ({
  editorValue: '',
  setEditorValue: (value: string) => {
    set({ editorValue: value });
  },
  destroy: () => {
    set({ editorValue: '' });
  },
}));

export default useBoardStore;
