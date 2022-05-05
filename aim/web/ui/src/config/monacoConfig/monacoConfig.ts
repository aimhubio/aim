import { AppNameEnum } from 'services/models/explorer';

export const getMonacoConfig = (advanced = false): any => ({
  height: advanced ? '63px' : '21px',
  options: {
    lineNumbers: 'off',
    minimap: { enabled: false },
    fontFamily: '"Iosevka", monospace',
    wordWrap: advanced ? 'on' : 'off',
    fontSize: 14,
    fontWeight: 'medium',
    lineNumbersMinChars: 0,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    lineDecorationsWidth: 0,
    hideCursorInOverviewRuler: true,
    contextmenu: false,
    glyphMargin: false,
    wordBasedSuggestions: false,
    folding: false,
    scrollBeyondLastColumn: 0,
    renderLineHighlight: 'none',
    scrollbar: { horizontal: 'hidden', vertical: 'hidden' },
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'never',
    },
  },

  theme: {
    name: 'aim-theme',
    config: {
      base: 'vs',
      inherit: true,
      rules: [{ background: 'ffffff' }],
      colors: {
        'editor.foreground': '#414b6d',
        'editor.background': '#ffffff',
        'editorCursor.foreground': '#83899e',
        'dropdown.background': '#fff',
        'editorSuggestWidget.background': '#fff',
        'editorSuggestWidget.border': '#dceafb',
        'editorSuggestWidget.selectedBackground': '#dceafb',
        'editorSuggestWidget.selectedForeground': '#414b6d',
        'editorSuggestWidget.highlightForeground': '#1c2852',
        'editorSuggestWidget.focusHighlightForeground': '#1c2852',
        'editorSuggestWidget.foreground': '#414b6d',
        'list.hoverBackground': '#dceafb',
        'scrollbar.shadow': '#fff',
      },
    },
  },
});

export const getSuggestionsByExplorer = (
  explorerName: AppNameEnum,
  data: any,
) => {
  const defaultSuggestions = {
    run: {
      hash: '',
      name: '',
      experiment: '',
      tags: '',
      archived: '',
      creation_time: '',
      end_time: '',
      ...data,
    },
  };
  const explorersList = {
    [AppNameEnum.RUNS]: defaultSuggestions,
    [AppNameEnum.METRICS]: defaultSuggestions,
    [AppNameEnum.PARAMS]: defaultSuggestions,
    [AppNameEnum.SCATTERS]: defaultSuggestions,
    [AppNameEnum.IMAGES]: defaultSuggestions,
  };
  return explorersList[explorerName];
};
