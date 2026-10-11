import { AppNameEnum } from 'services/models/explorer';

const WHITE = '#fff';
const TEXT_COLOR = '#414b6d';
const BORDER_COLOR = '#a1c7f5';
export const getMonacoConfig = (
  advanced = false,
  dark = false,
): Record<any, any> => ({
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
      base: dark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [{ background: dark ? '151a26' : 'ffffff' }],
      colors: {
        'editor.foreground': dark ? '#e5eaf3' : TEXT_COLOR,
        'editor.background': dark ? '#151a26' : WHITE,
        'editorCursor.foreground': '#83899e',
        'dropdown.background': dark ? '#151a26' : WHITE,
        'editorSuggestWidget.background': dark ? '#151a26' : WHITE,
        'editorSuggestWidget.border': dark ? '#45516a' : BORDER_COLOR,
        'editorSuggestWidget.selectedBackground': dark ? '#2a405e' : '#dceafb',
        'editorSuggestWidget.selectedForeground': dark ? '#e5eaf3' : TEXT_COLOR,
        'editorSuggestWidget.highlightForeground': dark ? '#b5c7ef' : '#1c2852',
        'editorSuggestWidget.focusHighlightForeground': dark
          ? '#b5c7ef'
          : '#1c2852',
        'editorSuggestWidget.foreground': dark ? '#e5eaf3' : TEXT_COLOR,
        'list.hoverBackground': dark ? '#27374f' : '#f3f8fe',
        'scrollbar.shadow': dark ? '#151a26' : WHITE,
        'editorHoverWidget.background': dark ? '#151a26' : WHITE,
        'editorHoverWidget.border': dark ? '#45516a' : BORDER_COLOR,
        'editorHoverWidget.statusBarBackground': dark ? '#151a26' : WHITE,
        'editorHoverWidget.foreground': dark ? '#e5eaf3' : TEXT_COLOR,
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
    [AppNameEnum.TEXT]: defaultSuggestions,
  };
  return explorersList[explorerName] || defaultSuggestions;
};
