import create from 'zustand';

import { IconCheck } from '@tabler/icons-react';

import { IToastProps } from 'components/kit_v2/Toast';

import {
  BoardData,
  BoardsRequestBody,
  TemplateData,
  createBoard,
  deleteBoard,
  fetchBoardByPath,
  fetchBoardsList,
  fetchBoardsTemplates,
  fetchTemplateById,
  resetBoardById,
  updateBoard,
} from 'modules/core/api/boardsApi';

interface BoardStore {
  isLoading: boolean;
  editorValue: string;
  consoleOpen: boolean;
  boardsList: string[];
  boards: Record<string, BoardData> | null;
  template: TemplateData | null;
  appName: string;
  templatesList: TemplateData[];
  notifyData: IToastProps[];
  setAppName: (value: string) => void;
  setConsoleOpen: (value: boolean) => void;
  setEditorValue: (value: string) => void;
  fetchBoardList: () => Promise<void>;
  onNotificationDelete: (id: string) => void;
  addNotifyData: ({ status, message, icon }: any) => void;
  fetchBoard: (path: string, appName?: string) => Promise<void>;
  addBoard: (boardBody: BoardsRequestBody) => Promise<void>;
  editBoard: (id: string, boardBody: BoardsRequestBody) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
  resetBoard: (id: string) => Promise<void>;
  destroy: () => void;
}

const useBoardStore = create<BoardStore>((set, get) => ({
  editorValue: '',
  isLoading: false,
  consoleOpen: true,
  boardsList: [],
  templatesList: [],
  notifyData: [],
  boards: null,
  template: null,
  appName: '',
  addNotifyData: ({ status = 'success', message = '', icon = null }: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: IToastProps = {
      id,
      icon,
      status,
      message,
      onDelete: (id: any) => {
        get().onNotificationDelete(id);
      },
    };
    set({
      notifyData: [...get().notifyData, notification],
    });
  },
  onNotificationDelete: (id: string) => {
    set({
      notifyData: [...get().notifyData].filter((n) => n.id !== id),
    });
  },
  setConsoleOpen: (value: boolean) => {
    set({ consoleOpen: value });
  },
  setEditorValue: (value: string) => {
    set({ editorValue: value });
  },
  setAppName: (value: string) => {
    set({ appName: value });
  },

  fetchBoardList: async () => {
    try {
      const boardsList = await fetchBoardsList();
      set({ boardsList, isLoading: false });
    } catch (err: any) {
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
      set({ isLoading: false });
    }
  },
  fetchBoard: async (boardPath: string, appName?: string) => {
    try {
      let pkg = get().appName || appName;
      if (!boardPath.includes(':') && pkg) {
        boardPath = `${pkg}:${boardPath}`;
      }

      const boards = await fetchBoardByPath(boardPath);
      set({
        boards: {
          ...get().boards,
          [boardPath]: boards,
        },
        isLoading: false,
      });
    } catch (err: any) {
      set({ boards: null });
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
    }
  },
  addBoard: async (boardBody: BoardsRequestBody) => {
    try {
      const data = await createBoard(boardBody);
      const boardsList = [...get().boardsList, data];
      get().addNotifyData({
        status: 'success',
        message: 'Board created successfully',
        icon: <IconCheck />,
      });
      // set({ boardsList });
    } catch (err: any) {
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
    }
  },
  editBoard: async (path: string, boardBody: BoardsRequestBody) => {
    try {
      const data = await updateBoard(path, boardBody);
      const boardsList = [...get().boardsList];
      const index = boardsList.findIndex((boardPath) => boardPath === path);
      // boardsList[index] = data;
      get().addNotifyData({
        status: 'success',
        message: 'Board updated successfully',
        icon: <IconCheck />,
      });
      set({
        boardsList,
        // board: data,
      });
    } catch (err: any) {
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
    }
  },
  removeBoard: async (path: string) => {
    try {
      deleteBoard(path);
      const boardsList = [...get().boardsList].filter(
        (boardPath) => boardPath !== path,
      );
      get().addNotifyData({
        status: 'success',
        message: 'Board removed successfully',
        icon: <IconCheck />,
      });
      set({ boardsList });
    } catch (err: any) {
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
    }
  },
  resetBoard: async (id: string) => {
    try {
      const data = await resetBoardById(id);
      const boardsList = [...get().boardsList];
      const index = boardsList.findIndex((boardPath) => boardPath === id);
      // boardsList[index] = data;
      get().addNotifyData({
        status: 'success',
        message: 'Board reset successfully',
        icon: <IconCheck />,
      });
      set({ boardsList });
    } catch (err: any) {
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
    }
  },
  fetchTemplatesList: async () => {
    try {
      const templatesList = await fetchBoardsTemplates();
      set({ templatesList, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
    }
  },
  fetchTemplate: async (id: string) => {
    try {
      const template = await fetchTemplateById(id);
      set({ template, isLoading: false });
    } catch (err: any) {
      get().addNotifyData({
        status: 'danger',
        message: err.message,
      });
    }
  },
  destroy: () => {
    set({ editorValue: '', isLoading: true, boardsList: [], boards: null });
  },
}));

export default useBoardStore;
