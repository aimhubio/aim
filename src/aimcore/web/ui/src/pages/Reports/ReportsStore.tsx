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
  report: ReportsProps | any;
  editorValue: string;
  setEditorValue: (value: string) => void;
  getReportsData: () => Promise<void>;
  addCatchError: (error: any) => void;
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
  editorValue: '',
  setEditorValue: (value: string) => {
    set({ editorValue: value });
  },
  report: {
    name: 'New Report',
    description: '',
    code: '',
  },
  addCatchError: (error: any) => {
    set({ isLoading: false });
    useNotificationServiceStore.getState().onNotificationAdd({
      status: 'danger',
      message: error.detail,
    });
  },
  getReportsData: async () => {
    set({ isLoading: true });
    try {
      const reportsData = await fetchReportsList();
      set({ listData: reportsData, isLoading: false });
    } catch (error: any) {
      get().addCatchError(error);
    }
  },

  getReportData: async (reportId: string) => {
    set({ isLoading: true });
    try {
      const reportData = await fetchReport(reportId);
      set({
        report: reportData,
        isLoading: false,
        editorValue: reportData.code,
      });
    } catch (error: any) {
      get().addCatchError(error);
    }
  },

  onReportCreate: async (reqBody: ReportsRequestBodyProps) => {
    try {
      const report = await createReport(reqBody);
      const listData = get().listData;
      if (listData.length !== 0) {
        set({
          listData: [...listData, report],
        });
      }
      set({
        report: {
          name: report.name,
          description: report.description,
          code: report.code,
        },
      });
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'success',
        message: 'Report created successfully',
      });
      return report;
    } catch (error: any) {
      get().addCatchError(error);
    }
  },

  onReportDelete: async (reportId: string) => {
    try {
      await deleteReport(reportId);
      set({
        listData: get().listData.filter((report) => report.id !== reportId),
      });
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'success',
        message: 'Report deleted successfully',
      });
    } catch (error: any) {
      get().addCatchError(error);
    }
  },

  onReportUpdate: async (reportId: string, reportBody: any) => {
    try {
      const reportData = await updateReport(reportId, reportBody);
      set({
        listData: get().listData.map((report) =>
          report.id === reportId ? reportData : report,
        ),
        report: reportData,
      });
      useNotificationServiceStore.getState().onNotificationAdd({
        status: 'success',
        message: 'Report updated successfully',
      });
    } catch (error: any) {
      get().addCatchError(error);
    }
  },

  destroy: () => {
    set({
      listData: [],
      report: {
        name: 'New Report',
        description: '',
        code: '',
      },
    });
  },
}));

export default useReportsStore;
