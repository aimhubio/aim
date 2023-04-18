export const ANALYTICS_EVENT_KEYS = {
  metrics: {
    pageView: '[MetricsExplorer] Page view',
    liveUpdate: '[MetricsExplorer] Live update',
    createBookmark: '[MetricsExplorer] Create bookmark',
    searchClick: '[MetricsExplorer] Search click',
    useAdvancedSearch: '[MetricsExplorer] Use advanced search',
    table: {
      exports: {
        csv: '[MetricsExplorer][Table] Export CSV',
      },
      archiveRunsBatch: '[MetricsExplorer][Table] Archive runs by batch',
      deleteRunsBatch: '[MetricsExplorer][Table] Delete runs by batch',
      changeResizeMode: '[MetricsExplorer][Table] Change view (Resize) mode',
      changeColumnOrder: '[MetricsExplorer][Table] Change columns order',
      showAllColumns: '[MetricsExplorer][Table] Show all columns',
      hideAllColumns: '[MetricsExplorer][Table] Hide all columns',
      showDiff: '[MetricsExplorer][Table] Show columns diff',
      changeTableRowHeight: '[MetricsExplorer][Table] Change rows height',
      changeSorting: '[MetricsExplorer][Table] Change sorting',
      metricVisibilityChange:
        '[MetricsExplorer][Table] Change metric visibility',
      compareSelectedRuns: '[MetricsExplorer][Table] Compare selected runs',
    },
    chart: {
      controls: {
        changeAggregation:
          '[MetricsExplorer][Chart][Controls] Change aggregation mode', // to Enable/Disable
        changeAggregationMethod:
          '[MetricsExplorer][Chart][Controls] Change aggregation method', // type value
        changeXAxisProperties:
          '[MetricsExplorer][Chart][Controls] Change X-Axis properties', // , Set type to value/, Align X axis by another value
        changeAxesScale:
          '[MetricsExplorer][Chart][Controls] Change Axes Scale type', // to value
        changeAxesScaleRange:
          '[MetricsExplorer][Chart][Controls] Change Axes Scale range', // to value
        selectSmoothingOptions:
          '[MetricsExplorer][Chart][Controls] Set smoothing options', // to value
        changeCurveInterpolationMode:
          '[MetricsExplorer][Chart][Controls] Change curve interpolation mode',
        changeOutliers: '[MetricsExplorer][Chart][Controls] Change outliers', // to Ignore/Display
        changeHighlightMode:
          '[MetricsExplorer][Chart][Controls] Change highlight mode', // to value
        changeZoomMode: '[MetricsExplorer][Chart][Controls] Change zoom mode', //to value
        tooltip: {
          changeTooltipContent:
            '[MetricsExplorer][Chart][Controls] Change tooltip content',
          display:
            '[MetricsExplorer][Chart][Controls] Change tooltip visibility on hover',
          appearance:
            '[MetricsExplorer][Chart][Controls] Change tooltip appearance mode to',
        },
        legends: {
          display:
            '[MetricsExplorer][Chart][Controls] Change legends visibility', // to visible/hidden
          mode: '[MetricsExplorer][Chart][Controls] Change legends mode', // to pinned/unpinned
        },
        exportChart: '[MetricsExplorer][Chart][Controls] Export Chart as Image',
      },
    },
    groupings: {
      chart: {
        modeChange: '[MetricsExplorer][Grouping][Chart] mode change to reverse',
      },
      color: {
        modeChange: '[MetricsExplorer][Grouping][Color] mode change to reverse',
        paletteChange: '[MetricsExplorer][Grouping][Color] palette change',
        persistenceChange:
          '[MetricsExplorer][Grouping][Color] persistence change', // to Enable/Disable
      },
      stroke: {
        modeChange: '[MetricsExplorer][Grouping][Stroke] mode change',
        persistenceChange:
          '[MetricsExplorer][Grouping][Stroke] persistence change',
      },
    },
  },
  params: {
    pageView: '[ParamsExplorer] Page view',
    liveUpdate: '[ParamsExplorer] Live update',
    createBookmark: '[ParamsExplorer] Create bookmark',
    searchClick: '[ParamsExplorer] Search click',
    useAdvancedSearch: '[ParamsExplorer] Use advanced search',
    table: {
      exports: {
        csv: '[ParamsExplorer][Table] Export CSV',
      },
      archiveRunsBatch: '[ParamsExplorer][Table] Archive runs by batch',
      deleteRunsBatch: '[ParamsExplorer][Table] Delete runs by batch',
      changeResizeMode: '[ParamsExplorer][Table] Change view (Resize) mode',
      changeColumnOrder: '[ParamsExplorer][Table] Change columns order',
      showAllColumns: '[ParamsExplorer][Table] Show all columns',
      hideAllColumns: '[ParamsExplorer][Table] Hide all columns',
      showDiff: '[ParamsExplorer][Table] Show columns diff',
      changeTableRowHeight: '[ParamsExplorer][Table] Change rows height',
      changeSorting: '[ParamsExplorer][Table] Change sorting',
      metricVisibilityChange:
        '[ParamsExplorer][Table] Change metric visibility',
      compareSelectedRuns: '[ParamsExplorer][Table] Compare selected runs',
    },
    chart: {
      controls: {
        changeCurveInterpolationMode:
          '[ParamsExplorer][Chart][Controls] Change curve interpolation mode',
        tooltip: {
          changeTooltipContent:
            '[ParamsExplorer][Chart][Controls] Change tooltip content',
          display:
            '[ParamsExplorer][Chart][Controls] Change tooltip visibility on hover',
          appearance:
            '[ParamsExplorer][Chart][Controls] Change tooltip appearance mode to',
        },
        changeColorIndicatorMode:
          '[ParamsExplorer][Chart][Controls] Change color indicator mode', // to value
      },
    },
    groupings: {
      chart: {
        modeChange: '[ParamsExplorer][Grouping][Chart] mode change to reverse',
      },
      color: {
        modeChange: '[ParamsExplorer][Grouping][Color] mode change',
        paletteChange: '[ParamsExplorer][Grouping][Color] palette change',
        persistenceChange:
          '[ParamsExplorer][Grouping][Color] persistence change',
      },
      stroke: {
        modeChange: '[ParamsExplorer][Grouping][Stroke] mode change',
        persistenceChange:
          '[ParamsExplorer][Grouping][Stroke] persistence change',
      },
    },
  },
  runs: {
    pageView: '[RunsExplorer] Page view',
    liveUpdate: '[RunsExplorer] Live update',
    createBookmark: '[RunsExplorer] Create bookmark',
    searchClick: '[RunsExplorer] Search click',
    table: {
      exports: {
        csv: '[RunsExplorer][Table] Export CSV',
      },
      archiveRunsBatch: '[RunsExplorer][Table] Archive runs by batch',
      deleteRunsBatch: '[RunsExplorer][Table] Delete runs by batch',
      changeResizeMode: '[RunsExplorer][Table] Change view (Resize) mode',
      changeColumnsOrder: '[RunsExplorer][Table] Change columns order',
      showAllColumns: '[RunsExplorer][Table] Show all columns',
      hideAllColumns: '[RunsExplorer][Table] Hide all columns',
      showDiff: '[RunsExplorer][Table] Show columns diff',
      changeTableRowHeight: '[RunsExplorer][Table] Change rows height',
      changeSorting: '[RunsExplorer][Table] Change sorting',
      metricVisibilityChange: '[RunsExplorer][Table] Change metric visibility',
      compareSelectedRuns: '[RunsExplorer][Table] Compare selected runs',
    },
  },
  scatters: {
    pageView: '[ScattersExplorer] Page view',
    liveUpdate: '[ScattersExplorer] Live update',
    createBookmark: '[ScattersExplorer] Create bookmark',
    searchClick: '[ScattersExplorer] Search click',
    useAdvancedSearch: '[ScattersExplorer] Use advanced search',
    table: {
      exports: {
        csv: '[ScattersExplorer][Table] Export CSV',
      },
      archiveRunsBatch: '[ScattersExplorer][Table] Archive runs by batch',
      deleteRunsBatch: '[ScattersExplorer][Table] Delete runs by batch',
      changeResizeMode: '[ScattersExplorer][Table] Change view (Resize) mode',
      changeColumnsOrder: '[ScattersExplorer][Table] Change columns order',
      showAllColumns: '[ScattersExplorer][Table] Show all columns',
      hideAllColumns: '[ScattersExplorer][Table] Hide all columns',
      showDiff: '[ScattersExplorer][Table] Show columns diff',
      changeTableRowHeight: '[ScattersExplorer][Table] Change rows height',
      changeSorting: '[ScattersExplorer][Table] Change sorting',
      metricVisibilityChange:
        '[ScattersExplorer][Table] Change metric visibility',
      compareSelectedRuns: '[ScattersExplorer][Table] Compare selected runs',
    },
    chart: {
      controls: {
        changeTrendlineOptions:
          '[ScattersExplorer][Chart][Controls] Change trendline options',
        tooltip: {
          changeTooltipContent:
            '[ScattersExplorer][Chart][Controls] Change tooltip content',
          display:
            '[ScattersExplorer][Chart][Controls] Change tooltip visibility on hover',
          appearance:
            '[ScattersExplorer][Chart][Controls] Change tooltip appearance mode to',
        },
        exportChart:
          '[ScattersExplorer][Chart][Controls] Export Chart as Image',
      },
    },
    groupings: {
      chart: {
        modeChange:
          '[ScattersExplorer][Grouping][Chart] mode change to reverse',
      },
      color: {
        modeChange: '[ScattersExplorer][Grouping][Color] mode change', // to reverse
        paletteChange: '[ScattersExplorer][Grouping][Color] palette change', //to 8/24 colors
        persistenceChange:
          '[ScattersExplorer][Grouping][Color] persistence change',
      },
    },
  },
  images: {
    pageView: '[ImagesExplorer] Page view',
    createBookmark: '[ImagesExplorer] Create bookmark',
    searchClick: '[ImagesExplorer] Search click',
    useAdvancedSearch: '[ImagesExplorer] Use advanced search',
    table: {
      exports: {
        csv: '[ImagesExplorer][Table] Export CSV',
      },
      archiveRunsBatch: '[ImagesExplorer][Table] Archive runs by batch',
      deleteRunsBatch: '[ImagesExplorer][Table] Delete runs by batch',
      changeResizeMode: '[ImagesExplorer][Table] Change view (Resize) mode',
      changeColumnsOrder: '[ImagesExplorer][Table] Change columns order',
      showAllColumns: '[ImagesExplorer][Table] Show all columns',
      hideAllColumns: '[ImagesExplorer][Table] Hide all columns',
      showDiff: '[ImagesExplorer][Table] Show columns diff',
      changeTableRowHeight: '[ImagesExplorer][Table] Change rows height',
      changeSorting: '[ImagesExplorer][Table] Change sorting',
      metricVisibilityChange:
        '[ImagesExplorer][Table] Change metric visibility',
      compareSelectedRuns: '[ImagesExplorer][Table] Compare selected runs',
    },
    groupings: {
      row: {
        modeChange: '[ImagesExplorer][Grouping][Group] mode change to reverse', //to reverse
        select: '[ImagesExplorer][Grouping][Group] Select group',
      },
    },
    imagesPanel: {
      clickApplyButton: '[ImagesExplorer][ImagesPanel] Click apply button',
      controls: {
        changeImageProperties:
          '[ImagesExplorer][ImagesPanel][Controls] Change image properties', // size, ... image rendering to type
        changeSorting:
          '[ImagesExplorer][ImagesPanel][Controls] Change images sort',
        groupStacking:
          '[ImagesExplorer][ImagesPanel][Controls] Change group stacking', // to Enabled/Disabled
        tooltip: {
          changeTooltipContent:
            '[ImagesExplorer][ImagesPanel][Controls] Change tooltip content',
          display:
            '[ImagesExplorer][Chart][Controls] Change tooltip visibility on hover',
          appearance:
            '[ImagesExplorer][Chart][Controls] Change tooltip appearance mode to',
        },
      },
      openFullSizeMode:
        '[ImagesExplorer][ImagesPanel][ImageBox] Open full size mode',
    },
  },
  experiment: {
    pageView: '[Experiment] Page view',
    tabs: {
      overview: {
        tabView: '[Experiment] [Overview] Tab view',
      },
      runs: {
        tabView: '[Experiment] [Runs] Tab view',
      },
      notes: {
        tabView: '[Experiment] [Notes] Tab view',
        clickSaveButton: '[Experiment] [Notes] Click save button',
        clickUpdateButton: '[Experiment] [Notes] Click update button',
        clickDeleteButton: '[Experiment] [Notes] Click delete button',
      },
      settings: {
        tabView: '[Experiment] [Settings] Tab view',
      },
    },
    table: {
      compareSelectedRuns: '[Experiment] [Runs] Compare selected runs',
    },
  },
  runDetails: {
    pageView: '[RunDetail] Page view',
    tabs: {
      overview: {
        tabView: '[RunDetail] [Overview] Tab view',
      },
      metrics: {
        tabView: '[RunDetail] [Metrics] Tab view',
      },
      params: {
        tabView: '[RunDetail] [Params] Tab view',
      },
      system: {
        tabView: '[RunDetail] [System] Tab view',
      },
      distributions: {
        tabView: '[RunDetail] [Distributions] Tab view',
        clickApplyButton: '[RunDetail] [Distributions] Click apply button',
        changeContext: '[RunDetail] [Distributions] Change context',
        onClickHeatMapCell: '[RunDetail] [Distributions] Click heatmap cell',
      },
      images: {
        tabView: '[RunDetail] [Images] Tab view',
        clickApplyButton: '[RunDetail] [Images] Click apply button',
        changeContext: '[RunDetail] [Images] Change context',
      },
      texts: {
        tabView: '[RunDetail] [Texts] Tab view',
        clickApplyButton: '[RunDetail] [Texts] Click apply button',
        changeContext: '[RunDetail] [Texts] Change context',
      },
      notes: {
        tabView: '[RunDetail] [Notes] Tab view',
        clickSaveButton: '[RunDetail] [Notes] Click save button',
        clickUpdateButton: '[RunDetail] [Notes] Click update button',
        clickDeleteButton: '[RunDetail] [Notes] Click delete button',
      },
      audios: {
        tabView: '[RunDetail] [Audios] Tab view',
        clickApplyButton: '[RunDetail] [Audios] Click apply button',
        changeContext: '[RunDetail] [Audios] Change context',
      },
      figures: {
        tabView: '[RunDetail] [Figures] Tab view',
        clickApplyButton: '[RunDetail] [Figures] Click apply button',
        changeContext: '[RunDetail] [Figures] Change context',
      },
      settings: {
        tabView: '[RunDetail] [Settings] Tab view',
        deleteRun: '[RunDetail] [Settings] Delete run',
        archiveRun: '[RunDetail] [Settings] Archive run',
      },
      logs: {
        tabView: '[RunDetail] [Logs] Tab view',
      },
    },
  },
  tags: {
    pageView: '[TagsPage] Page view',
    create: '[TagsPage] Create tag',
    tagDetail: '[TagsPage] Open tag detail page',
    tabChange: '[TagsPage] Tab change',
  },
  bookmarks: {
    pageView: '[BookmarksPage] Page view',
    view: '[BookmarksPage] View bookmark',
  },
  dashboard: {
    pageView: '[DashboardPage] Page view',
    activityCellClick: '[DashboardPage] Click on Activity cell',
    createGithubIssue: '[DashboardPage] Click on create gitHub issue',
    docs: '[DashboardPage] Click on documentation icon',
    colab: '[DashboardPage] Click on colab notebook icon',
    liveDemo: '[DashboardPage] Click on Live demo icon',
    table: {
      compareSelectedRuns: '[MetricsExplorer][Table] Compare selected runs',
    },
  },
  sidebar: {
    discord: '[Sidebar] Click on discord community link',
    docs: '[Sidebar] Click on docs link',
  },
  figures: {} as any,
  audios: {} as any,
  text: {} as any,
};
