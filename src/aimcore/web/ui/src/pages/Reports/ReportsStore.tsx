import create from 'zustand';

import { IToastProps } from 'components/kit_v2/Toast';
import useNotificationServiceStore from 'components/NotificationServiceContainer/NotificationServiceStore';

import {
  createReport,
  deleteReport,
  fetchReport,
  fetchReportsList,
  updateReport,
} from 'modules/core/api/reportsApi';
import {
  ReportsProps,
  ReportsRequestBodyProps,
} from 'modules/core/api/reportsApi/types.d';

// Replace this with your actual IToastProps interface definition

interface ReportsStore {
  isLoading: boolean;
  listData: any[];
  notifyData: IToastProps[];
  report: any;
  getReportsData: () => Promise<void>;
  getReportData: (reportId: string) => Promise<void | ReportsProps>;
  onReportDelete: (reportId: string) => Promise<void>;
  onReportUpdate: (reportId: string, reportBody: any) => Promise<void>;
  onReportCreate: (
    reportBody: ReportsRequestBodyProps,
  ) => Promise<ReportsProps | void>;
  destroy: () => void;
}

const useReportsStore = create<ReportsStore>((set, get) => ({
  isLoading: true,
  listData: [],
  notifyData: [],
  report: null,
  getReportsData: async () => {
    set({ isLoading: true });
    try {
      const reportsData = await fetchReportsList();
      set({ listData: reportsData, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'error',
        message: error.message,
      });
    }
  },

  getReportData: async (reportId: string) => {
    set({ isLoading: true });
    try {
      const reportData = await fetchReport(reportId);
      set({ report: reportData, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'error',
        message: error.message,
      });
    }
  },

  onReportCreate: async (reqBody: ReportsRequestBodyProps) => {
    try {
      await createReport(reqBody);
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'success',
        message: 'Report created successfully',
      });
    } catch (error: any) {
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'error',
        message: error.message,
      });
    }
  },

  onReportDelete: async (reportId: string) => {
    try {
      await deleteReport(reportId);
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'success',
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'error',
        message: error.message,
      });
    }
  },

  onReportUpdate: async (reportId: string, reportBody: any) => {
    try {
      await updateReport(reportId, reportBody);
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'success',
        message: 'Report updated successfully',
      });
    } catch (error: any) {
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'error',
        message: error.message,
      });
    }
  },

  destroy: () => {},
}));

export default useReportsStore;
