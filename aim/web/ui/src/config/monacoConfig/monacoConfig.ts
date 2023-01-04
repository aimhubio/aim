import { AppNameEnum } from 'services/models/explorer';

const WHITE = '#fff';
const TEXT_COLOR = '#414b6d';
const BORDER_COLOR = '#a1c7f5';
export const getMonacoConfig = (advanced = false): Record<any, any> => ({
  height: advanced ? '62px' : '24px',
  options: {
    lineNumbers: 'off',
    minimap: { enabled: false },
    fontFamily: '"Inconsolata", monospace',
    wordWrap: advanced ? 'on' : 'off',
    fontSize: 16,
    fontWeight: '500',
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
        'editor.foreground': TEXT_COLOR,
        'editor.background': WHITE,
        'editorCursor.foreground': '#83899e',
        'dropdown.background': WHITE,
        'editorSuggestWidget.background': WHITE,
        'editorSuggestWidget.border': BORDER_COLOR,
        'editorSuggestWidget.selectedBackground': '#dceafb',
        'editorSuggestWidget.selectedForeground': TEXT_COLOR,
        'editorSuggestWidget.highlightForeground': '#1c2852',
        'editorSuggestWidget.focusHighlightForeground': '#1c2852',
        'editorSuggestWidget.foreground': TEXT_COLOR,
        'list.hoverBackground': '#f3f8fe',
        'scrollbar.shadow': WHITE,
        'editorHoverWidget.background': WHITE,
        'editorHoverWidget.border': BORDER_COLOR,
        'editorHoverWidget.statusBarBackground': WHITE,
        'editorHoverWidget.foreground': TEXT_COLOR,
      },
    },
  },
});

export const monacoSyntaxHighlighter: any = {
  ...getMonacoConfig().options,
  readonly: true,
};
export const getSuggestionsByExplorer = (
  explorerName: AppNameEnum,
  data: Record<any, any>,
): Record<any, any> => {
  const defaultSuggestions = {
    run: {
      active: false,
      hash: '',
      name: '',
      experiment: '',
      tags: '',
      archived: false,
      created_at: 0,
      finalized_at: 0,
      duration: 0,
      ...(data?.params || {}),
    },
  };

  const explorersList = {
    [AppNameEnum.RUNS]: defaultSuggestions,
    [AppNameEnum.METRICS]: defaultSuggestions,
    [AppNameEnum.PARAMS]: defaultSuggestions,
    [AppNameEnum.SCATTERS]: defaultSuggestions,
    [AppNameEnum.IMAGES]: defaultSuggestions,
    [AppNameEnum.FIGURES]: defaultSuggestions,
    [AppNameEnum.AUDIOS]: defaultSuggestions,
  };
  return explorersList[explorerName] || defaultSuggestions;
};
