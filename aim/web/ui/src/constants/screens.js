// site
export const NOT_FOUND = '/not-found';
export const INCOMPATIBLE_VERSION = '/incompatible-version';

// hub
export const MAIN = '/';
export const EXPLORE = '/explore';
export const EXPLORE_SEARCH = '/explore?search=:search';
export const EXPLORE_BOOKMARK = '/explore/:bookmark_id';
export const EXPLORE_BOOKMARK_SEARCH = '/explore/:bookmark_id?search=:search';
export const HUB_BOOKMARKS = '/bookmarks';
export const HUB_PROJECT_EXECUTABLES = '/processes';
export const HUB_PROJECT_CREATE_EXECUTABLE = '/process/template/new';
export const HUB_PROJECT_EXECUTABLE_DETAIL = '/process/template/:executable_id';
export const HUB_PROJECT_EXECUTABLE_PROCESS_DETAIL = '/process/:process_id';
export const HUB_PROJECT_TAGS = '/tags';
export const HUB_PROJECT_CREATE_TAG = '/tag/new';
export const HUB_PROJECT_EDIT_TAG = '/tag/:tag_id';
export const HUB_TF_SUMMARY_LIST = '/tf/summary/list';
export const HUB_PROJECT_EXPERIMENT_DASHBOARD = '/dashboard';
export const HUB_PROJECT_EXPERIMENT_DASHBOARD_SEARCH =
  '/dashboard?search=:search';
export const HUB_PROJECT_EXPERIMENT_DEFAULT = '/experiment/default/latest';
export const HUB_PROJECT_EXPERIMENT_INDEX = '/experiment/default/index';
export const HUB_PROJECT_EXPERIMENT = '/experiment/:experiment_name/:commit_id';
export const HUB_PROJECT_EXPERIMENT_PARAMS_TAB =
  '/experiment/:experiment_name/:commit_id/parameters';
export const HUB_PROJECT_EXPERIMENT_METRICS_TAB =
  '/experiment/:experiment_name/:commit_id/metrics';
export const HUB_PROJECT_EXPERIMENT_SYSTEM_TAB =
  '/experiment/:experiment_name/:commit_id/system';
export const HUB_PROJECT_EXPERIMENT_SETTINGS_TAB =
  '/experiment/:experiment_name/:commit_id/settings';
