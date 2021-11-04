import React from 'react';
import styled from 'styled-components';

import './style.scss';
const SuggestionsContainer: any = styled.div`
  /* left: calc(${(props: any) => props.caretPosition * 12}px - 28px); */
`;

function CodeCompletion({
  value,
  options,
  caretPosition,
  open = true,
}: any): React.FunctionComponentElement<React.ReactNode> | null {
  console.log(caretPosition);

  let [suggestionsList, setSuggestionsList] = React.useState<string[]>([]);
  const list = [
    'metric.name',
    'metric.context',
    'run.hash',
    'run.params',
    'run.params.bs',
    'run.params.lr',
    'run.params.lr.rr.ss',
    'run.params.lr.rv.ss',
    'run.params.lr.dd.ss',
  ];

  console.log();

  React.useEffect(() => {
    setSuggestionsList(getSuggestionsList());
  }, [value]);

  function getSuggestionsList(): string[] | [] {
    const suggestions: string[] = [];
    let result = /\S+$/.exec(value.slice(0, caretPosition))?.[0];

    if (result?.includes('.')) {
      list.forEach((option) => {
        let suggest = option.split(`${result}`)[1];
        let splitSuggest = suggest?.split('.');
        let splitOption = option.split('.');

        if (splitSuggest?.length === 1) {
          if (splitSuggest[0] !== '' && splitOption[splitOption.length - 1]) {
            suggestions.push(splitOption[splitOption.length - 1]);
          }
        } else {
          if (
            suggestions.indexOf(splitSuggest?.[0]) === -1 &&
            suggestionsList.indexOf(
              result?.split('.')?.[result?.split('.')?.length - 1] +
                splitSuggest?.[0] || '',
            ) === -1
          ) {
            if (splitSuggest?.[0]) suggestions.push(splitSuggest?.[0]);
          }
        }
      });
    }

    return suggestions;
  }

  return suggestionsList.length > 0 ? (
    <SuggestionsContainer
      className='CodeCompletion'
      caretPosition={caretPosition}
    >
      {suggestionsList.map((suggestion) => (
        <div
          className='CodeCompletion__SuggestionItem'
          key={suggestion + Date.now()}
        >
          {suggestion}
        </div>
      ))}
    </SuggestionsContainer>
  ) : null;
}

CodeCompletion.displayName = 'CodeCompletion';

export default CodeCompletion;
