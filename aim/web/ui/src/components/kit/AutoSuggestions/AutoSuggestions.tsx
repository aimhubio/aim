import React from 'react';
import styled from 'styled-components';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';

import { Text } from 'components/kit';

import { IAutoSuggestionsProps } from './AutoSuggestions.d';

import './AutoSuggestions.scss';

const SuggestionsContainer: any = styled.div`
  left: ${(props: any) => props.suggestionsPosition.left}px;
  top: ${(props: any) => props.suggestionsPosition.top}px;
  border: ${(props: any) => props.isEmpty && 'unset'};
`;
function AutoSuggestions({
  inputRef,
  suggestionsRef,
  suggestionsList,
  suggestionsPosition,
  onSuggestionClick,
  setSuggestionsList,
}: IAutoSuggestionsProps): React.FunctionComponentElement<React.ReactNode> | null {
  const { buttonProps, itemProps } = useDropdownMenu(suggestionsList.length);
  React.useEffect(() => {
    if (suggestionsRef) {
      suggestionsRef.current.itemProps = { ...itemProps };
      suggestionsRef.current.buttonProps = { ...buttonProps };
    }
  }, []);

  function onSuggestionsKeyDown(
    e: React.KeyboardEvent<HTMLDivElement | any>,
  ): void {
    if (e.key === 'Escape') {
      inputRef.current.focus();
    } else {
      if (buttonProps.onKeyDown) {
        buttonProps?.onKeyDown(e);
      }
    }
  }

  function onSuggestionsBlur(e: React.FocusEvent<HTMLDivElement>): void {
    if (!e.relatedTarget) {
      setSuggestionsList([]);
    }
  }

  return (
    <SuggestionsContainer
      {...buttonProps}
      className='AutoSuggestions'
      aria-expanded={true}
      suggestionsPosition={suggestionsPosition}
      isEmpty={!suggestionsList.length}
      onKeyDown={onSuggestionsKeyDown}
      onBlur={onSuggestionsBlur}
    >
      {suggestionsList?.map((suggestion: string, index: number) => (
        <a
          key={suggestion}
          className='AutoSuggestions__item'
          onClick={() => onSuggestionClick(suggestion)}
          {...itemProps[index]}
        >
          <Text size={14}>{suggestion}</Text>
        </a>
      ))}
    </SuggestionsContainer>
  );
}

AutoSuggestions.displayName = 'AutoSuggestions';

export default AutoSuggestions;
