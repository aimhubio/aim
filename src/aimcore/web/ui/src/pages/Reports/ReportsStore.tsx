import create from 'zustand';

import { IconCheck } from '@tabler/icons-react';

import { IToastProps } from 'components/kit_v2/Toast';

import {
  createReport,
  deleteReport,
  fetchReport,
  fetchReportsList,
  updateReport,
} from 'modules/core/api/reportsApi';

import generateId from 'utils/generateId';

// Replace this with your actual IToastProps interface definition

interface ReportsStore {
  isLoading: boolean;
  listData: any[];
  notifyData: IToastProps[];
  report: any;
  getReportsData: () => Promise<void>;
  getReportData: (reportId: string) => Promise<void>;
  onReportDelete: (reportId: string) => Promise<void>;
  deleteNotification: (id: string) => void;
  addNotification: ({ status, message, icon }: any) => void;
  destroy: () => void;
}

const useReportsStore = create<ReportsStore>((set, get) => ({
  isLoading: true,
  listData: [],
  notifyData: [],
  report: null,
  addNotification: ({ status = 'success', message = '', icon = null }: any) => {
    const id = generateId();
    const notification: IToastProps = {
      id,
      icon,
      status,
      message,
      onDelete: (id: any) => {
        get().deleteNotification(id);
      },
    };
    set({
      notifyData: [...get().notifyData, notification],
    });
  },
  deleteNotification: (id: string) => {
    set({
      notifyData: [...get().notifyData].filter((n) => n.id !== id),
    });
  },
  getReportsData: async () => {
    try {
      const reportsData = await fetchReportsList();
      set({ listData: reportsData, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      get().addNotification({
        status: 'error',
        message: error.message,
        icon: <IconCheck />,
      });
    }
  },

  getReportData: async (reportId: string) => {
    try {
      const reportData = await fetchReport(reportId);
      set({ report: reportData, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      get().addNotification({
        status: 'error',
        message: error.message,
      });
    }
  },

  onReportCreate: async (reportBody: any) => {
    try {
      await createReport(reportBody);
      get().addNotification({
        status: 'success',
        message: 'Report created successfully',
      });
    } catch (error: any) {
      get().addNotification({
        status: 'error',
        message: error.message,
      });
    }
  },

  onReportDelete: async (reportId: string) => {
    try {
      await deleteReport(reportId);
      get().addNotification({
        status: 'success',
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      get().addNotification({
        status: 'error',
        message: error.message,
      });
    }
  },

  onReportUpdate: async (reportId: string, reportBody: any) => {
    try {
      await updateReport(reportId, reportBody);
      get().addNotification({
        status: 'success',
        message: 'Report updated successfully',
      });
    } catch (error: any) {
      get().addNotification({
        status: 'error',
        message: error.message,
      });
    }
  },

  destroy: () => {},
}));

export default useReportsStore;
