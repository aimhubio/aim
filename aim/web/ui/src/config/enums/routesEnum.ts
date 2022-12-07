enum PathEnum {
  Dashboard = '/',
  Runs = '/runs',
  Metrics = '/metrics',
  Metrics_Id = '/metrics/:appId',
  Params = '/params',
  Params_Id = '/params/:appId',
  Tags = '/tags',
  Bookmarks = '/bookmarks',
  Run_Detail = '/runs/:runHash',
  Experiment = '/experiments/:experimentId',
  Scatters = '/scatters',
  Scatters_Id = '/scatters/:appId',
  Images_Explore = '/images',
  Images_Explore_Id = '/images/:appId',
  Figures_Explorer = '/figures',
  Audios_Explorer = '/audios',
  New_Figures_Explorer = '/new-fig',
}

export { PathEnum };
