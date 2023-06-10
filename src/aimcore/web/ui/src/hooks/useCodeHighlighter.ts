import React from 'react';

import { useMonaco } from '@monaco-editor/react';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';

function useCodeHighlighter(language: string = 'python') {
  const monaco = useMonaco();
  const preRef = React.useRef<HTMLPreElement | any>(null);

  const monacoConfig: Record<string | number | symbol, any> =
    React.useMemo(() => {
      return getMonacoConfig();
    }, []);

  React.useEffect(() => {
    if (monaco && preRef.current) {
      monacoConfig.theme.config.colors = {
        ...monacoConfig.theme.config.colors,
        'editor.background': '#f2f3f4',
      };
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      monaco.editor.setTheme(monacoConfig.theme.name);
      monaco.editor.colorizeElement(preRef.current, { theme: language });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco]);
  return { elementRef: preRef };
}

export default useCodeHighlighter;
