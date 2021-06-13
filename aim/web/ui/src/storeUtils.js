import { memo } from 'react';
import { connect } from 'react-redux';
import * as classes from './constants/classes';
import * as progressActions from './actions/progress';
import * as projectActions from './actions/hub/project';
import * as controlPanelActions from './actions/hub/controlPanel';
import * as executablesActions from './actions/hub/executables';
import * as commitActions from './actions/hub/commit';
import * as tagsActions from './actions/hub/tags';
import * as dashboardActions from './actions/hub/dashboard';
import * as appActions from './actions/hub/app';

export function getWithState(caseName, caseClass) {
  let mapState2Props;
  let mapDispatch2Props = {
    resetProgress: progressActions.resetProgress,
    incProgress: progressActions.incProgress,
    completeProgress: progressActions.completeProgress,
  };

  switch (caseName) {
    // App
    case classes.APP:
      mapState2Props = (state) => ({
        loadProgress: state.default.loadProgress,
        ...state.project,
      });
      Object.assign(mapDispatch2Props, {
        getProject: projectActions.getProject,
      });
      break;
    // Wrappers
    case classes.BASE_WRAPPER:
      break;
    case classes.SITE_WRAPPER:
      break;
    case classes.HUB_WRAPPER:
      mapState2Props = (state) => ({
        ...state.project,
      });
      break;
    case classes.HUB_PROJECT_WRAPPER:
      mapState2Props = (state) => ({
        ...state.project,
      });
      Object.assign(mapDispatch2Props, {
        getProjectData: projectActions.getProjectData,
        updateProjectData: projectActions.updateProjectData,
        getProjectParams: projectActions.getProjectParams,
      });
      break;
    // Components
    case classes.HEADER:
      mapState2Props = (state) => ({
        ...state.project,
      });
      break;
    case classes.PANEL_POPUPS:
      Object.assign(mapDispatch2Props, {
        getCommitTags: commitActions.getCommitTags,
        getCommitInfo: commitActions.getCommitInfo,
        updateCommitTag: commitActions.updateCommitTag,
        killRunningExecutable: executablesActions.killRunningExecutable,
        getTags: tagsActions.getTags,
      });
      break;
    case classes.RUNNING_EXEC_LIST:
      Object.assign(mapDispatch2Props, {
        getRunningExecutables: executablesActions.getRunningExecutables,
        killRunningExecutable: executablesActions.killRunningExecutable,
      });
    case classes.EXPLORE_PARAMS_SELECT_INPUT:
      mapState2Props = (state) => ({
        ...state.project,
      });
      Object.assign(mapDispatch2Props, {
        getProjectParams: projectActions.getProjectParams,
      });
    // Screens
    case classes.HUB_MAIN_SCREEN:
      Object.assign(mapDispatch2Props, {
        getCommitsMetricsByQuery: commitActions.getCommitsMetricsByQuery,
        alignXAxisByMetric: commitActions.alignXAxisByMetric,
        getCommitsDictionariesByQuery:
          commitActions.getCommitsDictionariesByQuery,
        getRunningExecutables: executablesActions.getRunningExecutables,
        killRunningExecutable: executablesActions.killRunningExecutable,
        getAppState: appActions.getApp,
        createApp: appActions.createApp,
        updateApp: appActions.updateApp,
        createDashboard: dashboardActions.createDashboard,
      });
      break;
    case classes.HUB_BOOKMARKS_SCREEN:
      Object.assign(mapDispatch2Props, {
        getDashboardsList: dashboardActions.getDashboardsList,
        getAppsList: appActions.getAppsList,
      });
      break;
    case classes.HUB_PROJECT_SCREEN:
      mapState2Props = (state) => ({
        ...state.project,
      });
      break;
    case classes.HUB_PROJECT_EXECUTABLES:
      Object.assign(mapDispatch2Props, {
        executeExecutable: executablesActions.executeExecutable,
        createExecutable: executablesActions.createExecutable,
        getExecutables: executablesActions.getExecutables,
        executeExecutableTemplate: executablesActions.executeExecutableTemplate,
      });
      break;
    case classes.HUB_PROJECT_CREATE_EXECUTABLE:
      Object.assign(mapDispatch2Props, {
        executeExecutable: executablesActions.executeExecutable,
        createExecutable: executablesActions.createExecutable,
        getExecutables: executablesActions.getExecutables,
      });
      break;
    case classes.HUB_PROJECT_EXECUTABLE_DETAIL:
      Object.assign(mapDispatch2Props, {
        executeExecutable: executablesActions.executeExecutable,
        executeExecutableForm: executablesActions.executeExecutableForm,
        getExecutable: executablesActions.getExecutable,
        saveExecutable: executablesActions.saveExecutable,
        hideExecutable: executablesActions.hideExecutable,
      });
      break;
    case classes.HUB_TF_SUMMARY_LIST_SCREEN:
      mapState2Props = (state) => ({
        loadProgress: state.default.loadProgress,
        ...state.project,
      });
      Object.assign(mapDispatch2Props, {
        getTFSummaryList: commitActions.getTFSummaryList,
        getTFLogParams: commitActions.getTFLogParams,
        postTFLogParams: commitActions.postTFLogParams,
      });
      break;
    case classes.HUB_PROJECT_EXECUTABLE_PROCESS_DETAIL:
      Object.assign(mapDispatch2Props, {
        getExecutableProcess: executablesActions.getExecutableProcess,
      });
      break;
    case classes.HUB_PROJECT_TAGS:
      Object.assign(mapDispatch2Props, {
        getTags: tagsActions.getTags,
      });
      break;
    case classes.HUB_PROJECT_EDIT_TAG:
      Object.assign(mapDispatch2Props, {
        getTag: tagsActions.getTag,
        updateTag: tagsActions.updateTag,
        getRelatedRuns: tagsActions.getRelatedRuns,
      });
      break;
    case classes.HUB_PROJECT_CREATE_TAG:
      Object.assign(mapDispatch2Props, {
        postNewTag: tagsActions.postNewTag,
      });
      break;
    case classes.HUB_PROJECT_EXPERIMENT_SCREEN:
      mapState2Props = (state) => ({
        ...state.project,
      });
      Object.assign(mapDispatch2Props, {
        getExperiment: projectActions.getExperiment,
        getExperimentComponent: projectActions.getExperimentComponent,
        getCommitTags: commitActions.getCommitTags,
        updateCommitArchivationFlag: commitActions.updateCommitArchivationFlag,
      });
      break;
    case classes.HUB_PROJECT_EXPERIMENTS_DASHBOARD_SCREEN:
      Object.assign(mapDispatch2Props, {
        getRunsByQuery: commitActions.getRunsByQuery,
        getProjectActivity: projectActions.getProjectActivity,
      });
      mapState2Props = (state) => ({
        ...state.project,
      });
      break;
    default:
      break;
  }

  return connect(mapState2Props, mapDispatch2Props, null, { forwardRef: true })(
    memo(caseClass),
  );
}
